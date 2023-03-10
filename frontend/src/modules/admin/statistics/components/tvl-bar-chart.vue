<template>
  <div class="tvl-bar-chart">
    <h3 class="tvl-bar-chart__header">Current TVL</h3>
    <canvas :id="id" width="700" height="400"></canvas>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop, Emit} from "vue-property-decorator";
import StrategiesStore from "@/store/strategies.store";
import TransactionUniswapService from "@/services/transaction/transaction-uniswap.service";
import {Chart, ChartItem, registerables} from "chart.js";
import AggregatorStore from "@/store/aggregator.store";
import {GraphqlQueriesService} from "@/services/graphql.service";

Chart.register(...registerables);

@Component({components: {}})
export default class TvlBarChart extends Vue {
  @Prop({required: true}) backgroundColors!: string[];
  @Prop({required: true}) borderColors!: string[];

  public id: string = Math.random().toString();
  public chart: Chart<"bar", (number | undefined)[], string> | undefined;

  public chartLabels: string[] = [];
  public chartData: number[] = [];

  private readonly chartFontDetails = {
    font: {
      size: 12,
      family: "Montserrat"
    }
  };

  created() {
    setTimeout(async () => {
      await this.getData();

      Chart.defaults.plugins.legend = {
        ...Chart.defaults.plugins.legend,
        display: false
      };

      const ctx = document.getElementById(this.id) as ChartItem;
      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.chartLabels,
          datasets: [
            {
              data: this.chartData,
              backgroundColor: this.backgroundColors,
              borderColor: this.borderColors,
              borderWidth: 2
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                padding: 10,
                ...this.chartFontDetails
              }
            },
            x: {
              ticks: this.chartFontDetails
            }
          },
          events: [],
          animation: {
            onComplete: (x) => {
              const chart = x.chart;
              const {ctx} = chart;
              ctx.textAlign = "center";
              ctx.fillStyle = "white";
              ctx.textBaseline = "bottom";
              ctx.font = "12px 'Montserrat'";
              chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar, index) => {
                  const data = dataset.data[index];
                  ctx.fillText(`$${data}`, bar.x, bar.y - 5);
                });
              });
            }
          }
        }
      });

      this.dataLoaded();
    }, 500);
  }

  async getData() {
    const pools = await AggregatorStore.getNetworkPools(AggregatorStore.currentNetwork.id!);
    const tokensAddreses = pools.reduce((acc: string[], {token0Address, token1Address}) => [...acc, token0Address, token1Address], []);
    const tokensTvl = await GraphqlQueriesService.getTokensTvl(tokensAddreses);
    const strategies = await StrategiesStore.getNetworkStrategies(AggregatorStore.currentNetwork.id!);
    const strategiesTvl = await TransactionUniswapService.getStrategiesTvl(tokensTvl, strategies);
    strategiesTvl.forEach((strategy) => {
      this.chartLabels.push(strategy.pool);
      this.chartData.push(strategy.tvl);
    });
  }

  @Emit("data-loaded")
  dataLoaded() {}
}
</script>

<style scoped lang="scss">
.tvl-bar-chart {
  &__header {
    text-align: center;
    margin-bottom: 5px;
  }
}
</style>
