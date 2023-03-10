<template>
  <div class="aggregator-table">
    <aggregator-table-header :portfolio="portfolio" />
    <aggregator-table-row
      @mode-changed="modeChanged"
      :portfolio="portfolio"
      v-for="pool of pools"
      :key="pool.id"
      :pool="pool"
      :details-opened="pool.id === openedAggregator"
      @click="goToAggregator($event)"
    />
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop, Emit, Watch} from "vue-property-decorator";
import {Pool} from "@/interfaces";
import AggregatorTableRow from "@/modules/aggregator/components/aggregator-table-row.vue";
import AggregatorTableHeader from "@/modules/aggregator/components/aggregator-table-header.vue";
import { Route } from "vue-router";
@Component({
  components: {AggregatorTableHeader, AggregatorTableRow}
})
export default class AggregatorTable extends Vue {
  @Prop({required: true}) pools!: Pool[];
  @Prop({default: false}) portfolio!: boolean;

  private openedAggregator? = "";

  created() {
    this.openedAggregator = this.$route.params.id;
  }

  modeChanged() {
    this.portfolioModeChanged();
  }

  goToAggregator(id?: string) {
    this.$router.replace({
      name: this.$route.name!,
      params: id
        ? {
            id
          }
        : undefined,
      query: this.$route.query
    });
    this.openedAggregator = id;
  }

  @Emit("mode-changed")
  portfolioModeChanged() {}

  @Watch("$route")
  routerChanged(route: Route) {
    this.openedAggregator = route.params.id;
  }
}
</script>

<style scoped lang="scss">
.aggregator-table {
  width: 100%;
}
</style>
