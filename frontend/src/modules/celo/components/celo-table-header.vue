<template>
  <div class="celo-table_header">
    <div class="celo-table_header--cell"></div>
    <div class="celo-table_header--cell font__align--center">Balance</div>
    <div class="celo-table_header--cell font__align--center">Rewards Rate</div>
    <div class="celo-table_header--cell font__align--center">Rewards</div>
  </div>
</template>

<script lang="ts">
import {Vue, Component} from "vue-property-decorator";

@Component
export default class CeloTableHeader extends Vue {}
</script>

<style scoped lang="scss">
@import "@/styles/variables";
@import "@/styles/mixins/breakpoints.mixins.scss";

.celo-table_header {
  display: none;
}

@include respond-to("medium") {
  .celo-table_header {
    display: grid;
    grid-template-columns: $celo-table-columns;
    width: 100%;
    align-items: flex-end;
    padding-left: 2 * $theme-unit;
    padding-right: 2 * $theme-unit;

    &--cell {
      font-size: $font-sm;
      line-height: $font-sm-line;
    }
  }
}
</style>
