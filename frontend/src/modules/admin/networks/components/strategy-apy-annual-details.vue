<template>
  <div class="strategy-apy-annual">
    <canvas :id="chartData" width="200" height="200"></canvas>
    <detailed-chart-buttons class="strategy-apy-annual__buttons" v-if="showDetailedChart" @chart-data-changed="changeChartData" />

    <div class="strategy-apy-annual__details">
      <p class="strategy-apy-annual__details-text">
        Total fee / tvl from the last <b>{{ feeDays }}</b> days: ${{ strategy.totalFeesAnnual }}
      </p>

      <p class="strategy-apy-annual__details-text">
        APY: ${{ strategy.totalFeesAnnual }} * 100% * (365 / {{ feeDays }}) =
        <b>{{ strategy.apyFromFeesAnnual }}</b>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {Chart, ChartItem, registerables} from "chart.js";
import {Strategy} from "@/interfaces";
import DetailedChartButtons from "@/modules/_shared/charts/detailed-chart-buttons/detailed-chart-buttons.vue";

Chart.register(...registerables);

@Component({components: {DetailedChartButtons}})
export default class StrategyApyAnnualDetails extends Vue {
  @Prop({required: true}) strategy!: Strategy;

  // default annual data
  public chartData: string = "annual";
  public showDetailedChart: boolean = false;
  public chart: Chart<"line", ({x: string; y: number} | undefined)[], string> | undefined;
  public feeDays: number = 0;
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
      if (this.strategy.feesAnnual) {
        await this.getValues();
        this.createChart(this.chartData);
      }
    }, 200);
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

    this.chartData = newChartData;

    await this.getValues();
    this.createChart(this.chartData);
  }

  getValues() {
    this.feeDays = this.strategy.feesAnnual!.replace(/},{/g, "}|{").split("|").length;

    const strategyFeesAnnual = (this.strategy.feesAnnual! as string)
      .replace(/},{/g, "}|{")
      .split("|")
      .map((x) => JSON.parse(x));

    if (strategyFeesAnnual.length > 30) this.showDetailedChart = true;

    if (this.showDetailedChart) {
      switch (this.chartData) {
        case "weekly":
          this.getDetailedChartData(strategyFeesAnnual, "weekly");
          break;
        case "monthly":
          this.getDetailedChartData(strategyFeesAnnual, "monthly");
          break;
        case "annual":
          this.getChartData(strategyFeesAnnual);
          break;
      }
    } else {
      this.getDetailedChartData(strategyFeesAnnual);
    }
  }

  getDetailedChartData(strategyFeesAnnual: {fee: string; tvl: number; date: string}[], chartData?: string) {
    const tvlsChartData = {
      data: strategyFeesAnnual.map((data) => {
        return {
          x: data.date,
          y: data.tvl
        };
      }),
      label: "TVL",
      showLine: true,
      fill: false,
      borderColor: "#7001af"
    };

    const feesChartData = {
      data: strategyFeesAnnual.map((data) => {
        return {
          x: data.date,
          y: +(+data.fee).toFixed(4)
        };
      }),
      label: "Fee",
      showLine: true,
      fill: false,
      borderColor: "#eebb4d"
    };

    if (chartData) {
      switch (chartData) {
        case "weekly":
          tvlsChartData.data = tvlsChartData.data.slice(0, 7);
          feesChartData.data = feesChartData.data.slice(0, 7);
          break;
        case "monthly":
          tvlsChartData.data = tvlsChartData.data.slice(0, 30);
          feesChartData.data = feesChartData.data.slice(0, 30);
          break;
      }
    }

    tvlsChartData.data = tvlsChartData.data.reverse();
    feesChartData.data = feesChartData.data.reverse();
    this.datasets.push(tvlsChartData, feesChartData);
  }

  getChartData(strategyFeesAnnual: {fee: string; tvl: number; date: string}[]) {
    const result = strategyFeesAnnual.reduce<{
      fees: {x: string; sum: number; length: number}[];
      tvls: {x: string; sum: number; length: number}[];
    }>(
      (result, currentValue) => {
        const month = new Date(currentValue.date).toLocaleString("default", {month: "long"});
        const year = new Date(currentValue.date).getFullYear();
        const dateName = `${month} ${year}`;

        if (!result.fees.some((fee: {x: string; sum: number; length: number}) => fee.x == dateName)) {
          result.fees.push({x: dateName, sum: +currentValue.fee, length: 1});
        } else {
          const fee = result.fees.find((fee: {x: string; sum: number; length: number}) => fee.x == dateName)!;
          fee.sum = +fee.sum + +currentValue.fee;
          fee.length++;
        }

        if (!result.tvls.some((tvl: {x: string; sum: number; length: number}) => tvl.x == dateName)) {
          result.tvls.push({x: dateName, sum: currentValue.tvl, length: 1});
        } else {
          const tvl = result.tvls.find((tvl: {x: string; sum: number; length: number}) => tvl.x == dateName)!;
          tvl.sum = +tvl.sum + +currentValue.tvl;
          tvl.length++;
        }

        return result;
      },
      {
        fees: [],
        tvls: []
      }
    );

    const fees = result.fees
      .map((item) => {
        return {x: item.x, y: +(item.sum / item.length).toFixed(7)};
      })
      .reverse();

    const tvls = result.tvls
      .map((item) => {
        return {x: item.x, y: +(item.sum / item.length).toFixed(7)};
      })
      .reverse();

    const chartData = {fees, tvls};

    const tvlsChartData = {
      data: chartData.tvls,
      label: "TVL",
      showLine: true,
      fill: false,
      borderColor: "#7001af"
    };

    const feesChartData = {
      data: chartData.fees,
      label: "Fee",
      showLine: true,
      fill: false,
      borderColor: "#eebb4d"
    };

    this.datasets.push(tvlsChartData, feesChartData);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.strategy-apy-annual {
  background: transparent !important;
  margin-top: 20px;

  &__buttons {
    margin-top: 15px;
  }

  &__details {
    margin: 20px 0;

    &-text {
      font-size: $font-md;
      margin-bottom: 5px;
    }
  }
}
</style>
