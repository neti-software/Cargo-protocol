<template>
  <v-progress-circular indeterminate :size="size" :color="colorMap[walletType]">
    <wallet-logo v-if="!noWallet" :wallet-type="walletType" :size="iconSize" />
    <cargo-logo :showHeader="false" v-else :size="iconSize" />
  </v-progress-circular>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import CargoLogo from "@/modules/_shared/common/cargo-logo/cargo-logo.vue";
import WalletLogo from "@/modules/_shared/common/wallet-logo/wallet-logo.vue";
import {colorMap, WalletEnum} from "@/interfaces";

@Component({
  components: {CargoLogo, WalletLogo}
})
export default class Loader extends Vue {
  colorMap = colorMap;

  @Prop({default: WalletEnum.none}) readonly walletType!: WalletEnum;
  @Prop({default: 64}) readonly size!: number;
  @Prop({default: 45}) readonly iconSize!: number;

  get noWallet() {
    return this.walletType === WalletEnum.none;
  }
}
</script>
