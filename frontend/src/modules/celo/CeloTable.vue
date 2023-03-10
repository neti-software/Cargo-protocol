<template>
  <div class="celo-table">
    <celo-table-header />
    <celo-table-row v-for="pair of celoPairs" :key="pair.stakingProtocolAddress" :pair="pair" />
  </div>
</template>

<script lang="ts">
import {Vue, Component} from "vue-property-decorator";
import CeloTableRow from "@/modules/celo/components/celo-table-row.vue";
import CeloTableHeader from "@/modules/celo/components/celo-table-header.vue";
import CeloStore from "@/store/celo.store";

@Component({
  components: {CeloTableHeader, CeloTableRow}
})
export default class CeloTable extends Vue {
  get celoPairs() {
    return CeloStore.celoPairs;
  }
}
</script>

<style scoped lang="scss">
.celo-table {
  width: 100%;
}
</style>
