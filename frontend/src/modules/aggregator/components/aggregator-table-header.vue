<template>
  <div :class="`aggregator-table_header ${portfolio && 'portfolio'}`">
    <div class="aggregator-table_header--cell">Pool</div>
    <div class="aggregator-table_header--cell font__align--center">Balance</div>
    <div class="aggregator-table_header--cell font__align--center" v-if="!portfolio">TVL</div>
    <div class="aggregator-table_header--cell font__align--center d-flex align-center justify-center" v-if="!portfolio">
      APY

      <v-tooltip right color="red">
        <template v-slot:activator="{on, attrs}">
          <v-icon color="red" class="ml-2" small v-bind="attrs" v-on="on">mdi-help-circle</v-icon>
        </template>
        <span>Calibrated every 7 days</span>
      </v-tooltip>
    </div>

    <div class="aggregator-table_header--cell font__align--center" v-if="portfolio">Allocation</div>
    <div class="aggregator-table_header--cell">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop} from "vue-property-decorator";

@Component
export default class AggregatorTableHeader extends Vue {
  @Prop({default: false}) portfolio!: boolean;
}
</script>

<style scoped lang="scss">
@import "@/styles/variables";
@import "@/styles/mixins/breakpoints.mixins.scss";

.aggregator-table_header {
  display: none;
}

@include respond-to("medium") {
  .aggregator-table_header {
    display: grid;
    grid-template-columns: $aggregator-table-columns-large;
    width: 100%;
    align-items: flex-end;
    padding-left: 2 * $theme-unit;
    padding-right: 2 * $theme-unit;

    &--cell {
      font-size: $font-sm;
      line-height: $font-sm-line;
    }

    &.portfolio {
      grid-template-columns: $aggregator-table-columns-portfolio;
    }
  }
}
</style>
