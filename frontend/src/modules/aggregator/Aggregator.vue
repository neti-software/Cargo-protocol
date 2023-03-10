<template>
  <div class="aggregator-content" v-if="!wrongWalletNetwork">
    <asset-filter v-if="isAuthenticated" />
    <aggregator-table :pools="pools" />
  </div>
</template>

<script lang="ts">
import {Vue, Component, Watch} from "vue-property-decorator";
import AggregatorStore from "@/store/aggregator.store";
import AggregatorTable from "@/modules/aggregator/components/aggregator-table.vue";
import AssetFilter from "@/modules/_shared/common/asset-filter/asset-filter.vue";
import {Route} from "vue-router";
import StringService from "@/services/string.service";
import WalletStore from "@/store/wallet.store";
import CommonStore from "@/store/common.store";

@Component({
  components: {AssetFilter, AggregatorTable}
})
export default class Aggregator extends Vue {
  private selectedAsset: string = "";

  mounted() {
    this.handleAssetQuery(this.$route);
  }

  @Watch("$route")
  routerChanged(route: Route) {
    this.handleAssetQuery(route);
  }

  get isAuthenticated() {
    return WalletStore.isAuthenticated;
  }

  get pools() {
    return AggregatorStore.pools.filter(
      (pool) =>
        pool.isActive &&
        pool.networkId === AggregatorStore.currentNetwork.id! &&
        (StringService.isNullOrWhitespace(this.selectedAsset) ||
          pool.token0Address === this.selectedAsset ||
          pool.token1Address === this.selectedAsset)
    );
  }

  get wrongWalletNetwork() {
    return CommonStore.wrongWalletNetwork;
  }

  private handleAssetQuery(route: Route) {
    if (route.query["asset"]) {
      this.selectedAsset = route.query["asset"] as string;
    } else {
      this.selectedAsset = "";
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.nav-header {
  padding-left: 1.75 * $theme-unit;
}
</style>
