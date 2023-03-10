<template>
  <v-card rounded elevation="0" class="mt-2 pa-0">
    <v-card-text>
      <div class="celo-table_row">
        <div
          class="celo-table_row--cell flex-cell wide celo-table_row-1"
          v-bind:style="{
            'margin-left': hideLogos ? 0 : '50px'
          }"
        >
          <product-logos
            v-if="!hideLogos && pairLogos"
            :logos="pairLogos"
            :offset="15"
            :size="25"
            :top="hideAction || $vuetify.breakpoint.smAndDown ? 0 : 10"
            :left="0"
          />
          {{ pairNames }}
          <v-spacer v-if="!$vuetify.breakpoint.smAndUp" />
          <v-tooltip right color="primary">
            <template v-slot:activator="{on, attrs}">
              <span class="cell-fee" v-bind="attrs" v-on="on">{{ pair.fee | percent(true) }}</span>
            </template>
            <span>Uniswap swap fee</span>
          </v-tooltip>
        </div>

        <div class="celo-table_row--cell font__align--center celo-table_row-2">
          <div class="cell-mobile-help">Balance</div>
          <span v-if="pair.balanceOf && +pair.balanceOf == 0">-</span>
          <span v-else>{{ pair.balanceOf }} CELO</span>
        </div>

        <div class="celo-table_row--cell font__align--center celo-table_row-3">
          <div class="cell-mobile-help">Rewards rate</div>
          <span v-if="pair.rewardsRate && +pair.rewardsRate == 0">-</span>
          <span v-else>{{ pair.rewardsRate }} %</span>
        </div>

        <div class="celo-table_row--cell font__align--center celo-table_row-4">
          <div class="cell-mobile-help">Rewards</div>
          <span v-if="pair.rewardsAmount && +pair.rewardsAmount == 0">-</span>
          <span v-else>{{ pair.rewardsAmount }} CELO</span>
        </div>

        <div class="celo-table_row--cell font__align--center celo-table_row-5">
          <v-btn large rounded color="primary" @click="deposit">Deposit</v-btn>
        </div>
        <div class="celo-table_row--cell font__align--center celo-table_row-6">
          <v-btn large rounded color="primary" @click="withdraw">Withdraw</v-btn>
        </div>
        <div class="celo-table_row--cell font__align--center celo-table_row-7">
          <v-btn large rounded color="primary" @click="setupRewards">Rewards</v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import {Vue, Component, Prop} from "vue-property-decorator";
import {CeloPair} from "@/interfaces";
import ProductLogos from "@/modules/_shared/common/product-logos/product-logos.vue";
import ModalService from "@/services/modal.service";
import DepositRewardsModal from "@/modules/_shared/modals/deposit-rewards-modal/deposit-rewards-modal.vue";
import WithdrawRewardsModal from "@/modules/_shared/modals/withdraw-rewards-modal/withdraw-rewards-modal.vue";
import SetupRewardsModal from "@/modules/_shared/modals/setup-rewards-modal/setup-rewards-modal.vue";

@Component({
  components: {ProductLogos}
})
export default class CeloTableRow extends Vue {
  @Prop({required: true}) pair!: CeloPair;
  @Prop({default: false}) hideLogos!: boolean;
  @Prop({default: false}) hideAction!: boolean;
  @Prop({default: false}) detailsOpened!: boolean;

  get pairNames() {
    return `${this.pair.token0Name}/${this.pair.token1Name}`;
  }

  get pairLogos() {
    return [this.pair.token0Name, this.pair.token1Name];
  }

  deposit() {
    ModalService.open(DepositRewardsModal, {
      pair: this.pair
    });
  }

  withdraw() {
    ModalService.open(WithdrawRewardsModal, {
      pair: this.pair
    });
  }

  setupRewards() {
    ModalService.open(SetupRewardsModal, {
      pair: this.pair
    });
  }
}
</script>
<style scoped lang="scss">
@import "@/styles/variables";
@import "@/styles/mixins/breakpoints.mixins.scss";

.celo-table_row {
  display: grid;
  width: 100%;
  align-items: center;
  position: relative;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 0fr 1fr 1fr 1fr;
  grid-row-gap: 15px;

  &-1 {
    grid-area: 1 / 1 / 2 / 3;
  }
  &-2 {
    grid-area: 2 / 1 / 3 / 2;
  }
  &-3 {
    grid-area: 2 / 2 / 3 / 3;
  }
  &-4 {
    grid-area: 3 / 1 / 4 / 2;
  }
  &-5 {
    grid-area: 4 / 2 / 5 / 3;
  }
  &-6 {
    grid-area: 4 / 1 / 5 / 2;
  }
  &-7 {
    grid-area: 3 / 2 / 4 / 3;
  }

  &--cell {
    font-size: $font-lg;
    line-height: $font-lg-line;

    &.flex-cell {
      display: flex;
      gap: $theme-unit;
      align-items: center;
    }

    &.wide {
      grid-column: span 3;
      @include respond-to("medium") {
        grid-column: span 1;
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
  }

  .cell-fee {
    background: #3c3c3c;
    padding: 4px 8px;
    color: white;
    border-radius: $border-radius;
    font-size: $font-sm;

    @include respond-to("medium") {
      padding: 2px 4px;
      font-size: $font-xs;
    }
  }

  @include respond-to("medium") {
    grid-template-columns: $celo-table-columns;
    grid-template-rows: 1fr;

    &-1 {
      grid-area: 1 / 1 / 2 / 2;
    }
    &-2 {
      grid-area: 1 / 2 / 2 / 3;
    }
    &-3 {
      grid-area: 1 / 3 / 2 / 4;
    }
    &-4 {
      grid-area: 1 / 4 / 2 / 5;
    }
    &-5 {
      grid-area: 1 / 5 / 2 / 6;
    }
    &-6 {
      grid-area: 1 / 6 / 2 / 7;
    }
    &-7 {
      grid-area: 1 / 7 / 2 / 8;
    }
  }
}
</style>
