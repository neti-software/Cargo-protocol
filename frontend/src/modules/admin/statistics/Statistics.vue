<template>
  <div class="statistics">
    <tvl-bar-chart
      class="statistics__chart"
      v-show="dataLoaded"
      :backgroundColors="backgroundColors"
      :borderColors="borderColors"
      @data-loaded="tvlsBarChartLoaded = true"
    />
    <tvl-line-chart
      class="statistics__chart ml-10"
      v-show="dataLoaded"
      :backgroundColors="backgroundColors"
      @data-loaded="tvlsLineChartLoaded = true"
    />
    <apy-line-chart class="statistics__chart mt-5" v-show="dataLoaded" :backgroundColors="backgroundColors" />
  </div>
</template>

<script lang="ts">
import CommonStore from "@/store/common.store";
import {Vue, Component, Watch} from "vue-property-decorator";
import TvlBarChart from "./components/tvl-bar-chart.vue";
import TvlLineChart from "./components/tvl-line-chart.vue";
import ApyLineChart from "./components/apy-line-chart.vue";

@Component({components: {TvlBarChart, TvlLineChart, ApyLineChart}})
export default class Statistics extends Vue {
  public tvlsLineChartLoaded: boolean = false;
  public tvlsBarChartLoaded: boolean = false;
  public dataLoaded: boolean = false;

  public backgroundColors = [
    "rgba(255, 99, 132, 0.5)",
    "rgba(54, 162, 235, 0.5)",
    "rgba(136, 176, 75, 0.5)",
    "rgba(255, 206, 86, 0.5)",
    "rgba(105, 105, 105, 0.5)",
    "rgba(153, 102, 255, 0.5)",
    "rgba(75, 192, 192, 0.5)",
    "rgba(244, 164, 96,0.5)",
    "rgba(144, 238, 144, 0.5)",
    "rgba(186, 85, 211,0.5)"
  ];

  public borderColors = [
    "rgb(255, 99, 132)",
    "rgb(54, 162, 235)",
    "rgb(136, 176, 75)",
    "rgb(255, 206, 86)",
    "rgb(105, 105, 105)",
    "rgb(153, 102, 255)",
    "rgb(75, 192, 192)",
    "rgb(244, 164, 96)",
    "rgb(144, 238, 144)",
    "rgb(186, 85, 211)"
  ];

  created() {
    CommonStore.startLoading();
  }

  @Watch("tvlsLineChartLoaded")
  checkTvlsLineChartLoaded(value: boolean) {
    if (value && this.tvlsBarChartLoaded) this.dataLoaded = true;
    else CommonStore.startLoading();
  }

  @Watch("tvlsBarChartLoaded")
  checkTvlsBarChartLoaded(value: boolean) {
    if (value && this.tvlsLineChartLoaded) this.dataLoaded = true;
    else CommonStore.startLoading();
  }

  @Watch("dataLoaded")
  checkDataLoaded(value: boolean) {
    if (value) CommonStore.stopLoading();
  }
}
</script>

<style scoped lang="scss">
.statistics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);

  &__chart {
    min-width: 700px;
    min-height: 450px;
  }
}
</style>
