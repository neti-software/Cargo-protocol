<template>
  <div class="portfolio-content" v-if="isAuthenticated && !wrongWalletNetwork">
    <asset-filter v-if="isAuthenticated" :disabled-asset-addresses="disabledAssetAddresses" />
    <div class="portfolio-content__main">
      <div>
        <div class="portfolio-content__main-header">Open Positions</div>
        <v-card class="fancy-card fancy-card__gray flex-grow-1" elevation="0" rounded outlined>
          <aggregator-table @mode-changed="modeChanged" :portfolio="portfolioView" :pools="pools" />
        </v-card>
      </div>
      <div>
        <div class="portfolio-content__main-header">Asset Distribution</div>
        <v-card class="fancy-card fancy-card__gray" elevation="0" rounded outlined>
          <token-allocation-graph :pools="pools" :selected-asset="selectedAsset" :selected-pool="selectedPool" />
        </v-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Watch} from "vue-property-decorator";
import WalletStore from "@/store/wallet.store";
import AssetFilter from "@/modules/_shared/common/asset-filter/asset-filter.vue";
import AggregatorTable from "@/modules/aggregator/components/aggregator-table.vue";
import {Route} from "vue-router";
import AggregatorStore from "@/store/aggregator.store";
import StringService from "@/services/string.service";
import TokenAllocationGraph from "@/modules/portfolio/components/token-allocation-graph.vue";
import CommonStore from "@/store/common.store";
import AssetsStore from "@/store/assets.store";
import {Pool} from "@/interfaces";

@Component({
  components: {TokenAllocationGraph, AggregatorTable, AssetFilter}
})
export default class Portfolio extends Vue {
  public selectedAsset = "";
  public selectedPool = "";
  public portfolioView: boolean = true;

  async mounted() {
    if (!WalletStore.isAuthenticated || CommonStore.newUser) await this.$router.replace("/rebalancer");
    if (this.$route.params.id) {
      this.$route.query.asset
        ? this.$router.replace({path: `/portfolio?asset=${this.$route.query.asset}`})
        : await this.$router.replace("/portfolio");
    }
    this.handleUrlParams(this.$route);
  }

  modeChanged() {
    this.portfolioView = !this.portfolioView;
  }

  @Watch("$route")
  routerChanged(route: Route) {
    this.handleUrlParams(route);
  }

  get disabledAssetAddresses() {
    if (!this.portfolioView) {
      const availableAssetAddresses = this.pools.reduce((addresses: string[], pool) => {
        return [...addresses, pool.token0Address, pool.token1Address];
      }, []);
      const allAssetsAddresses = AssetsStore.assets.map(({address}) => address);
      return allAssetsAddresses.filter((address) => !availableAssetAddresses.includes(address));
    } else {
      return AssetsStore.assets.filter((asset) => asset.myAmount == asset.myAmountWallet).map(({address}) => address);
    }
  }

  get isAuthenticated() {
    return WalletStore.isAuthenticated;
  }

  get wrongWalletNetwork() {
    return CommonStore.wrongWalletNetwork;
  }

  get pools() {
    return AggregatorStore.pools.filter(
      (pool) =>
        pool.isActive &&
        pool.networkId === AggregatorStore.currentNetwork.id! &&
        pool.myTVL &&
        +pool.myTVL != 0 &&
        (StringService.isNullOrWhitespace(this.selectedPool) || pool.id === this.selectedPool) &&
        (StringService.isNullOrWhitespace(this.selectedAsset) ||
          pool.token0Address === this.selectedAsset ||
          pool.token1Address === this.selectedAsset)
    );
  }

  private handleUrlParams(route: Route) {
    if (route.query["asset"]) {
      this.selectedAsset = route.query["asset"] as string;
    } else {
      this.selectedAsset = "";
    }
    if (route.params["id"]) {
      this.selectedPool = route.params["id"];
    } else {
      this.selectedPool = "";
    }
  }

  @Watch("pools")
  handlePoolsChanged(pools: Pool[]) {
    if (pools.length === 0) {
      this.$router.replace({
        name: this.$route.name!,
        query: this.$route.query
      });
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/mixins/breakpoints.mixins";
@import "@/styles/variables";

.portfolio-content {
  &__main {
    display: flex;
    flex-direction: column;
    gap: $panel-gap;

    @include respond-to("medium") {
      display: grid;
      grid-template-columns: auto 334px;
    }
  }

  &__main-header {
    font-size: $font-sm;
    line-height: $font-sm-line;
    padding-left: 2 * $theme-unit;
    margin-bottom: $theme-unit;
  }
}
</style>
