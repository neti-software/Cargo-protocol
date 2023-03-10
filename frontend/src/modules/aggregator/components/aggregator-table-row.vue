<template>
  <v-card rounded elevation="0" class="mt-2 pa-0">
    <v-card-text>
      <div :class="`aggregator-table_row ${portfolio && 'portfolio'}`">
        <div
          class="aggregator-table_row--cell flex-cell wide"
          v-bind:style="{
            'margin-left': hideLogos ? 0 : '50px'
          }"
        >
          <product-logos
            v-if="!hideLogos && poolLogos"
            :logos="poolLogos"
            :offset="15"
            :size="25"
            :top="hideAction || $vuetify.breakpoint.mobile || $vuetify.breakpoint.smAndDown ? 0 : 10"
            :left="0"
          />
          {{ poolNames }}
          <v-spacer v-if="!$vuetify.breakpoint.smAndUp" />

          <v-tooltip right color="primary">
            <template v-slot:activator="{on, attrs}">
              <span class="cell-fee" v-bind="attrs" v-on="on">{{ pool.fee | percent(true) }}</span>
            </template>
            <span>Uniswap swap fee</span>
          </v-tooltip>
        </div>
        <div :class="`aggregator-table_row--cell font__align--center ${portfolio && 'portfolio--cell'}`">
          <div class="cell-mobile-help">Balance</div>
          <span v-if="pool.myTVL && +pool.myTVL == 0">-</span>
          <span v-else>$ {{ pool.myTVL }}</span>
        </div>
        <div class="aggregator-table_row--cell font__align--center" v-if="!portfolio">
          <div class="cell-mobile-help">TVL</div>
          <span v-if="pool.TVL && +pool.TVL == 0">-</span>
          <span v-else>$ {{ pool.TVL }}</span>
        </div>
        <div class="aggregator-table_row--cell font__align--center" v-if="!portfolio">
          <div class="cell-mobile-help tooltip">
            APY

            <v-tooltip right color="red" v-if="isMobile">
              <template v-slot:activator="{on, attrs}">
                <v-icon color="red" class="ml-2" small v-bind="attrs" v-on="on">mdi-help-circle</v-icon>
              </template>
              <span>Calibrated every 7 days</span>
            </v-tooltip>
          </div>
          {{ `${pool.APY && pool.APY > 0 ? `${pool.APY} %` : "-"}` }}
        </div>
        <div :class="`aggregator-table_row--cell font__align--center ${portfolio && 'portfolio--cell'}`" v-if="portfolio">
          <div class="cell-mobile-help">Allocation</div>
          {{ pool.token0Amount }} {{ pool.token0Name }} / {{ pool.token1Amount }} {{ pool.token1Name }}
        </div>
        <div class="aggregator-table_row--cell end wide" v-if="!hideAction">
          <span @click="click">
            <slot name="action">
              <v-btn large rounded color="primary" :outlined="detailsOpened">
                <div class="action-icon" v-bind:class="{rotate: detailsOpened}">
                  <span v-if="detailsOpened">Back</span>
                  <span v-else>Select</span>
                </div>
                <v-icon v-if="portfolio">mdi-arrow-down</v-icon>
              </v-btn>
            </slot>
          </span>
        </div>
      </div>
      <transition name="details" mode="out-in">
        <div v-if="detailsOpened" class="aggregator-table_row second">
          <aggregator-details class="full-row" :pool="pool" />
        </div>
      </transition>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import {Vue, Component, Prop, Emit} from "vue-property-decorator";
import {Pool} from "@/interfaces";
import ProductLogos from "@/modules/_shared/common/product-logos/product-logos.vue";
import AggregatorDetails from "@/modules/aggregator/components/aggregator-details.vue";
import UserAgentService from "@/services/user-agent.service";

@Component({
  components: {AggregatorDetails, ProductLogos}
})
export default class AggregatorTableRow extends Vue {
  @Prop({required: true}) pool!: Pool;
  @Prop({default: false}) hideLogos!: boolean;
  @Prop({default: false}) hideAction!: boolean;
  @Prop({default: false}) detailsOpened!: boolean;
  @Prop({default: false}) portfolio!: boolean;

  get isMobile() {
    return UserAgentService.isMobile();
  }

  get poolNames() {
    return `${this.pool.token0Name}/${this.pool.token1Name}`;
  }

  get poolLogos() {
    return [this.pool.token0Name, this.pool.token1Name];
  }

  click() {
    this.$emit("click", this.detailsOpened ? null : this.pool.id);
    this.portfolioModeChanged();
  }

  @Emit("mode-changed")
  portfolioModeChanged() {}
}
</script>
<style scoped lang="scss">
@import "@/styles/variables";
@import "@/styles/mixins/breakpoints.mixins.scss";

.details-enter-active {
  transition: all 0.3s ease;
}

.details-leave-active {
  transition: all 0.3s ease;
}

.details-enter,
.details-leave-to {
  overflow: hidden;
  transform: translateY(-50px);
  max-height: 0;
  opacity: 0;
  z-index: 0;
}

.details-enter-to,
.details-leave {
  max-height: 550px;
  overflow: hidden;
}

.aggregator-table_row {
  display: grid;
  grid-template-columns: $aggregator-table-columns-3;
  width: 100%;

  animation-duration: 300ms;

  align-items: center;
  position: relative;

  &.second {
    margin-top: 0;

    .full-row {
      grid-column-start: 1;
      grid-column-end: 7;
    }
  }

  &--cell {
    font-size: $font-lg;
    line-height: $font-lg-line;
    margin-bottom: 20px;

    @include respond-to("medium") {
      margin-bottom: 0;
    }

    &.flex-cell {
      display: flex;
      gap: $theme-unit;
      align-items: center;
    }

    &.end {
      text-align: end;
      margin-bottom: 0;
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

      &.tooltip {
        display: flex;
        align-content: center;
        justify-content: center;

        @include respond-to("medium") {
          display: none;
        }
      }
    }
  }

  &.portfolio {
    grid-template-columns: 1fr;
  }

  .portfolio--cell {
    margin-bottom: 15px;
    font-size: $font-sm;

    @include respond-to("medium") {
      margin-bottom: 0;
      font-size: $font-lg;
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

  .action-icon {
    width: 75px;
  }

  @include respond-to("medium") {
    grid-template-columns: $aggregator-table-columns-large;

    &.portfolio {
      grid-template-columns: $aggregator-table-columns-portfolio;
    }
  }
}
</style>
