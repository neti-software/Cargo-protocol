<template>
  <div
    class="aggregator-strategies__strategy"
    v-bind:class="{
      disabled: disabled
    }"
  >
    <div class="aggregator-strategies__strategy--cell wide">
      <span class="strategy-cell" v-bind:class="riskColor"> {{ strategy.name }} </span>

      <v-tooltip right v-if="explanation || disabled">
        <template v-slot:activator="{on, attrs}">
          <v-icon v-if="explanation" v-bind="attrs" v-on="on"> mdi-help-circle</v-icon>
          <v-icon v-if="disabled" v-bind="attrs" v-on="on"> mdi-lock</v-icon>
        </template>
        <span v-if="explanation">{{ explanation }}</span>
        <span v-if="disabled">Under construction</span>
      </v-tooltip>
    </div>
    <div class="aggregator-strategies__strategy--cell font__align--center">
      <div class="cell-mobile-help">Balance</div>
      <span v-if="strategy.myTVL && +strategy.myTVL == 0">-</span>
      <span v-else>$ {{ strategy.myTVL }}</span>
    </div>
    <div class="aggregator-strategies__strategy--cell tvl-cell font__align--center">
      <div class="cell-mobile-help">TVL</div>
      <span v-if="strategy.myTVL && +strategy.myTVL == 0">-</span>
      <aggregator-strategy-token-balance
        v-else
        :token0-value="strategy.token0USD"
        :token0-text="`${strategy.token0Amount && strategy.token0Amount.toFixed(2)} ${pool.token0Name}`"
        :token0-color="`${token0Color}`"
        :token1-value="strategy.token1USD"
        :token1-text="`${strategy.token1Amount && strategy.token1Amount.toFixed(2)} ${pool.token1Name}`"
        :token1-color="`${token1Color}`"
      />
    </div>
    <div class="aggregator-strategies__strategy--cell font__align--center">
      <div class="cell-mobile-help">APY</div>
      {{ `${strategy.apyFromFeesAnnual && +strategy.apyFromFeesAnnual > 0 ? `${strategy.apyFromFeesAnnual} %` : "-"}` }}
    </div>

    <div class="aggregator-strategies__strategy--cell action">
      <v-btn large color="primary" elevation="0" @click="manage" :disabled="!walletConnected">
        <div class="aggregator-strategies__strategy--button">Manage</div>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop, Emit} from "vue-property-decorator";
import {Strategy, Pool} from "@/interfaces";
import WalletStore from "@/store/wallet.store";
import AggregatorStrategyTokenBalance from "@/modules/aggregator/components/aggregator-strategy-token-balance.vue";
import AssetsStore from "@/store/assets.store";

@Component({
  components: {AggregatorStrategyTokenBalance}
})
export default class AggregatorStrategyRow extends Vue {
  @Prop({required: true}) strategy!: Strategy;
  @Prop({required: true}) pool!: Pool;
  @Prop({default: false}) disabled!: boolean;
  @Prop() explanation?: string;

  get riskColor(): string {
    switch (true) {
      case this.strategy.rangePercentage! <= 35:
        return "high";
      case this.strategy.rangePercentage! > 35 && this.strategy.rangePercentage! <= 70:
        return "medium";
      case this.strategy.rangePercentage! > 70:
        return "low";
      default:
        return "medium";
    }
  }

  get token0Color() {
    const token = AssetsStore.assets.find((token) => token.address === this.pool.token0Address);
    return token ? token.color : "#47bc6c";
  }

  get token1Color() {
    const token = AssetsStore.assets.find((token) => token.address === this.pool.token1Address);
    return token ? token.color : "#eebb4d";
  }

  get walletConnected() {
    return WalletStore.isAuthenticated;
  }

  @Emit("manage")
  manage() {}
}
</script>

<style scoped lang="scss">
@import "@/styles/variables";
@import "@/styles/mixins/breakpoints.mixins.scss";

.aggregator-strategies__strategy {
  display: grid;
  grid-template-columns: $aggregator-table-columns-2;
  padding: $theme-unit 0;
  border-radius: $border-radius;
  border: $border-light;
  margin-top: $theme-unit;
  align-items: center;

  @include respond-to("small") {
    grid-template-columns: $aggregator-table-columns-3;
  }

  @include respond-to("medium") {
    grid-template-columns: $aggregator-table-columns-large;
    border: none;
    margin-top: 0;
  }

  &--cell {
    position: relative;
    min-height: $panel-gap;

    .strategy-cell {
      position: absolute;
      top: -9px;
      left: -9px;
      border-top-right-radius: 2px;
      border-bottom-left-radius: 2px;

      @include respond-to("medium") {
        position: initial;
        border-radius: $border-radius;
        top: 0;
        left: 0;
      }
    }

    &.action {
      display: flex;
      gap: 4px;
      justify-content: flex-end;
      grid-column: span 2;
      margin-top: 20px;

      @include respond-to("small") {
        grid-column: span 3;
      }
      @include respond-to("medium") {
        grid-column: auto;
        margin-top: 0;
      }
    }

    &.tvl-cell {
      grid-row: 2;
      grid-column: span 2;
      @include respond-to("small") {
        grid-row: auto;
        grid-column: auto;
      }
    }

    &.wide {
      grid-column: span 2;
      @include respond-to("small") {
        grid-column: span 3;
      }
      @include respond-to("medium") {
        grid-column: span 1;
      }
    }
  }

  &:hover {
    background: #ffffff11;
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.9;
    font-size: $font-sm;

    .strategy-cell {
      background: gray;

      &__icon {
        display: inline;
      }
    }
  }

  .cell-mobile-help {
    font-size: $font-sm;
    color: $sub-text-color;
    margin-top: $theme-unit;
    @include respond-to("medium") {
      display: none;
    }
  }

  &--button {
    width: 77px;
  }
}
</style>
