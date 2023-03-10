<template>
  <div>
    <canvas :id="id" width="350" height="350"></canvas>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {Chart, ChartItem, registerables} from "chart.js";
import {externalTooltipHandler} from "@/modules/_shared/charts/chart.defaults";
import AssetsStore from "@/store/assets.store";
import {Pool} from "@/interfaces";
import StrategiesStore from "@/store/strategies.store";
import NumbersService from "@/services/numbers.service";

Chart.register(...registerables);

@Component
export default class TokenAllocationGraph extends Vue {
  public id: string;
  public chart: Chart<"pie", (number | undefined)[], string> | undefined;
  @Prop({required: true}) pools!: Pool[];
  @Prop({required: true}) selectedAsset!: string;
  @Prop({required: true}) selectedPool!: string;

  constructor() {
    super();
    this.id = Math.random().toString();
  }

  get assets() {
    return AssetsStore.assets;
  }

  get strategies() {
    return StrategiesStore.strategies.filter((strategy) => strategy.poolId === this.selectedPool);
  }

  mounted() {
    Chart.defaults.plugins.legend = {
      ...Chart.defaults.plugins.legend,
      display: false
    };
    const ctx = document.getElementById(this.id) as ChartItem;
    this.chart = new Chart(ctx, {
      type: "pie",
      data: this.getChartData(this.pools),
      options: {
        borderRadius: 8,
        plugins: {
          tooltip: {
            enabled: false,
            position: "nearest",
            external: externalTooltipHandler
          }
        }
      } as any
    });
  }

  getPoolColor(pool: Pool) {
    const colorA = this.assets.find((item) => item.address === pool.token0Address)?.color;
    const colorB = this.assets.find((item) => item.address === pool.token1Address)?.color;
    if (!colorA || !colorB) {
      return;
    }
    const amount = 0.5;
    const [rA, gA, bA] = colorA.match(/\w\w/g)!.map((c) => parseInt(c, 16));
    const [rB, gB, bB] = colorB.match(/\w\w/g)!.map((c) => parseInt(c, 16));
    const r = Math.round(rA + (rB - rA) * amount)
      .toString(16)
      .padStart(2, "0");
    const g = Math.round(gA + (gB - gA) * amount)
      .toString(16)
      .padStart(2, "0");
    const b = Math.round(bA + (bB - bA) * amount)
      .toString(16)
      .padStart(2, "0");
    return "#" + r + g + b;
  }

  getChartData(pools: Pool[]) {
    if (this.selectedAsset && this.selectedPool) {
      const assetFromWallet = this.assets.find((item) => item.address === this.selectedAsset);
      return {
        labels: [...this.strategies.map((strategy) => strategy.name), "Wallet"],
        datasets: [
          {
            data: [
              ...this.strategies.map((strategy) => {
                if (strategy.token0Address === this.selectedAsset) {
                  return strategy.token0Amount;
                } else {
                  return strategy.token1Amount;
                }
              }),
              NumbersService.parseStringValue(assetFromWallet?.myAmountWallet!)
            ],
            backgroundColor: [...this.colors.slice(0, this.strategies.length), this.walletCollor]
          }
        ]
      };
    }

    if (this.selectedAsset) {
      const assetFromWallet = this.assets.find((item) => item.address === this.selectedAsset);
      const data = {
        labels: [...this.pools.map((pool) => `${pool.token0Name}/${pool.token1Name}`), "Wallet"],
        datasets: [
          {
            data: [
              ...this.pools.map((pool) => {
                if (pool.token0Address === this.selectedAsset) {
                  return pool.token0Amount;
                } else {
                  return pool.token1Amount;
                }
              }),
              NumbersService.parseStringValue(assetFromWallet?.myAmountWallet!)
            ],
            backgroundColor: [...this.colors.slice(0, this.pools.length), this.walletCollor]
          }
        ]
      };
      return data;
    }

    if (this.selectedPool) {
      return {
        labels: this.strategies.map((strategy) => strategy.name),
        datasets: [
          {
            data: this.strategies.map((strategy) => +strategy.myTVL!),
            backgroundColor: this.colors
          }
        ]
      };
    }

    return {
      labels: pools.map((pool) => `${pool.token0Name}/${pool.token1Name}`),
      datasets: [
        {
          data: pools.map((pool) => +pool.myTVL!),
          backgroundColor: pools.map((pool) => this.getPoolColor(pool))
        }
      ]
    };
  }

  get colors() {
    return ["#0894F5", "#88B04B", "#6B5B95", "#0A0DAE", "#F7CAC9", "#B565A7"];
  }

  get walletCollor() {
    return "#E57D1B";
  }

  @Watch("pools")
  poolsUpdate(newPools: Pool[]) {
    if (this.chart) {
      this.chart.data = this.getChartData(newPools);
      this.chart.update();
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/mixins/breakpoints.mixins";

canvas {
  width: 240px !important;
  height: 240px !important;
  margin: 0 auto;

  @include respond-to("medium") {
    margin: 30px;
  }
}
</style>
