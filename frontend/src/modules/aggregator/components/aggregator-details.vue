<template>
  <div class="aggregator-strategies">
    <aggregator-strategy-row
        v-for="str of strategies"
        :strategy="str"
        :pool="pool"
        :key="str.name"
        @manage="manage(str)" />
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop} from "vue-property-decorator";
import {Pool, Strategy} from "@/interfaces";
import StrategiesStore from "@/store/strategies.store";
import AggregatorStrategyRow from "@/modules/aggregator/components/aggregator-strategy-row.vue";
import ModalService from "@/services/modal.service";
import DepositWithdrawModal from "@/modules/_shared/modals/deposit-withdraw-modal/deposit-withdraw-modal.vue";

@Component({
  components: {AggregatorStrategyRow}
})
export default class AggregatorDetails extends Vue {
  @Prop({required: true}) pool!: Pool;

  get strategies() {
    return StrategiesStore.strategies.filter((strategy) => strategy.poolId === this.$route.params.id);
  }

  manage(strategy: Strategy) {
    ModalService.open(DepositWithdrawModal, {
      pool: this.pool,
      strategy
    });
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables";
@import "@/styles/mixins/breakpoints.mixins.scss";

.aggregator-strategies {
  margin-top: $theme-unit;
  
  @include respond-to('medium') {
    margin-top: $panel-gap;
  }
}
</style>
