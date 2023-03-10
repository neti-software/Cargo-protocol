<template>
  <div class="chart">
    <v-btn
      :class="`chart__button ${chartData === 'weekly' && 'chart__button--disabled'}`"
      @click="showData('weekly')"
      :color="chartData === 'weekly' ? 'primary' : null"
      small
      >Last 7 days</v-btn
    >
    <v-btn
      :class="`chart__button ${chartData === 'monthly' && 'chart__button--disabled'}`"
      @click="showData('monthly')"
      :color="chartData === 'monthly' ? 'primary' : null"
      small
      >Last 30 days</v-btn
    >
    <v-btn
      :class="chartData === 'annual' && 'chart__button--disabled'"
      @click="showData('annual')"
      :color="chartData === 'annual' ? 'primary' : null"
      small
      >All</v-btn
    >
  </div>
</template>

<script lang="ts">
import {Vue, Component, Emit} from "vue-property-decorator";

@Component({components: {}})
export default class DetailedChartButtons extends Vue {
  public chartData: string = "annual";

  async showData(data: string) {
    switch (data) {
      case "weekly":
        this.chartData = "weekly";
        break;
      case "monthly":
        this.chartData = "monthly";
        break;
      case "annual":
        this.chartData = "annual";
        break;
    }

    this.$emit("chart-data-changed", this.chartData);
  }

  @Emit("chart-data-changed")
  chartDataChanged() {}
}
</script>

<style scoped lang="scss">
.chart {
  text-align: center;
  margin-bottom: 10px;

  &__button {
    margin-right: 5px;

    &--disabled {
      pointer-events: none;
    }
  }
}
</style>
