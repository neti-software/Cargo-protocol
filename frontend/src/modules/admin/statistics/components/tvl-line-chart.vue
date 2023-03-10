<template>
  <div class="tvl-line-chart" v-if="strategies.length > 0">
    <h3 class="tvl-line-chart__header">TVL (historical data)</h3>
    <detailed-chart-buttons v-if="showDetailedChart" @chart-data-changed="changeChartData" />

    <canvas :id="chartData" width="700" height="400"></canvas>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop, Emit} from "vue-property-decorator";
import StrategiesStore from "@/store/strategies.store";
import {Chart, ChartItem, registerables} from "chart.js";
import {Strategy} from "@/interfaces/strategy.interface";
import AggregatorStore from "@/store/aggregator.store";
import DetailedChartButtons from "@/modules/_shared/charts/detailed-chart-buttons/detailed-chart-buttons.vue";

Chart.register(...registerables);

@Component({components: {DetailedChartButtons}})
export default class TvlLineChart extends Vue {
  @Prop({required: true}) backgroundColors!: string[];

  public strategies: Strategy[] = [];

  // default annual data
  public chartData: string = "tvl-annual";
  public showDetailedChart: boolean = false;
  public chart: Chart<"line", ({x: string; y: number} | undefined)[], string> | undefined;
  public datasets: {
    data: {x: string; y: number}[];
    label: string;
    showLine: boolean;
    fill: boolean;
    borderColor: string;
  }[] = [];

  private readonly chartFontDetails = {
    font: {
      size: 12,
      family: "Montserrat"
    }
  };

  created() {
    setTimeout(async () => {
      this.strategies = await StrategiesStore.getNetworkStrategies(AggregatorStore.currentNetwork.id!);
      await this.getValues();
      this.createChart(this.chartData);
    }, 500);
  }

  async createChart(id: string) {
    const ctx = document.getElementById(id) as ChartItem;
    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: this.datasets
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: "right",
            labels: {
              padding: 10,
              ...this.chartFontDetails
            }
          },
          tooltip: {
            callbacks: {
              label: (item) => `${item.dataset.label}: $${item.formattedValue}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: this.chartFontDetails
          },
          x: {
            ticks: this.chartFontDetails
          }
        }
      }
    });
  }

  async changeChartData(newChartData: string) {
    const ctx = Chart.getChart(this.chartData);
    ctx!.destroy();
    this.datasets = [];

    this.chartData = `tvl-${newChartData}`;

    await this.getValues();
    this.createChart(this.chartData);
  }

  getValues() {
    const strategies = this.strategies
      .map((strategy) => {
        const pool = AggregatorStore.pools.find((pool) => pool.id === strategy.poolId);
        return {
          ...strategy,
          token0Address: pool!.token0Address,
          token0Name: pool!.token0Name,
          token1Address: pool!.token1Address,
          token1Name: pool!.token1Name,
          order: pool!.order
        };
      })
      .sort((a, b) => a.order! - b.order!);

    strategies.forEach((strategy, index) => {
      const strategyFeesAnnual = strategy
        .feesAnnual!.replace(/},{/g, "}|{")
        .split("|")
        .map((x) => JSON.parse(x));

      if (strategyFeesAnnual.length > 30) this.showDetailedChart = true;

      let chartData: {x: string; y: number}[];
      if (this.showDetailedChart) {
        switch (this.chartData) {
          case "tvl-weekly":
            chartData = this.getDetailedChartData(strategyFeesAnnual);
            chartData = chartData.slice(0, 7);
            break;
          case "tvl-monthly":
            chartData = this.getDetailedChartData(strategyFeesAnnual);
            chartData = chartData.slice(0, 30);
            break;
          case "tvl-annual":
            chartData = this.getAnnualChartData(strategyFeesAnnual);
            break;
        }
      } else {
        chartData = this.getDetailedChartData(strategyFeesAnnual);
      }

      this.datasets.push({
        data: chartData!.reverse(),
        label: `${strategy.token0Name}/${strategy.token1Name}`,
        showLine: true,
        fill: false,
        borderColor: this.backgroundColors[index]
      });
    });

    this.dataLoaded();
  }

  getDetailedChartData(strategyFeesAnnual: {fee: string; tvl: number; date: string}[]): {x: string; y: number}[] {
    return strategyFeesAnnual.map((strategy) => {
      return {
        x: strategy.date,
        y: +strategy.tvl.toFixed(2)
      };
    });
  }

  getAnnualChartData(strategyFeesAnnual: {fee: string; tvl: number; date: string}[]): {x: string; y: number}[] {
    const result = strategyFeesAnnual.reduce<{x: string; sum: number; length: number}[]>((result, currentValue) => {
      const month = new Date(currentValue.date).toLocaleString("default", {month: "long"});
      const year = new Date(currentValue.date).getFullYear();
      const dateName = `${month} ${year}`;

      if (!result.some((tvl: {x: string; sum: number; length: number}) => tvl.x == dateName)) {
        result.push({x: dateName, sum: currentValue.tvl, length: 1});
      } else {
        const tvl = result.find((tvl: {x: string; sum: number; length: number}) => tvl.x == dateName)!;
        tvl.sum = +tvl.sum + +currentValue.tvl;
        tvl.length++;
      }

      return result;
    }, []);

    return result.map((item) => {
      return {
        x: item.x,
        y: +(item.sum / item.length).toFixed(2)
      };
    });
  }

  @Emit("data-loaded")
  dataLoaded() {}
}
</script>

<style scoped lang="scss">
.tvl-line-chart {
  &__header {
    text-align: center;
    margin-bottom: 5px;
  }
}
</style>
