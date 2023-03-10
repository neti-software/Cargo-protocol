<template>
  <div>
    <v-tabs
        class="analytics-tabs"
        background-color="transparent"
        color="primary"
        light
        v-model="selectedTab"
    >
      <v-tab>Pairs Data</v-tab>
      <v-tab>Portfolio Tracker</v-tab>
      <v-tab>Borrow Charts</v-tab>
    </v-tabs>
    <div class="analytics-dashboard">
      <div class="left-pane">
        <div class="analytics-mobile-wrapper" v-bind:class="{selected: selectedTab === 0}">
        </div>
      </div>
      <div class="right-pane">
        <div class="analytics-mobile-wrapper" v-bind:class="{selected: selectedTab === 1}">
        </div>
        <div class="analytics-mobile-wrapper" v-bind:class="{selected: selectedTab === 2}">
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component} from "vue-property-decorator";

@Component
export default class Analytics extends Vue {
  public selectedTab = 0;

  selectTab(idx: number) {
    this.selectedTab = idx;
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";
@import "@/styles/mixins/breakpoints.mixins";

.analytics-tabs {
  @include respond-to('small') {
    display: none;
  }
}

.analytics-dashboard {
  display: flex;
  width: 100%;
  flex-direction: column;

  .left-pane {
    flex: 1;
  }

  .right-pane {
    flex: 1;
    max-width: 550px;
  }

  .selected {
    height: auto;
  }

  @include respond-to('small') {
    flex-direction: row;
  }

  .analytics-mobile-wrapper {
    display: none;
    &.selected {
      display: initial;
      animation: fadeInTop .1s ease-in-out 0s 1 forwards;
      -webkit-animation: fadeInTop .1s ease-in-out 0s 1 forwards;
      -moz-animation: fadeInTop .1s ease-in-out 0s 1 forwards;
    }
    @include respond-to('small') {
      display: initial !important;
    }
  }
}

::v-deep .v-slide-group__prev {
  display: none !important;
}
</style>
