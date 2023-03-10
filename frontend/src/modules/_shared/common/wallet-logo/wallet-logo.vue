<template>
  <div>
    <v-img v-if="!useBig && walletType === WalletEnum.metamask" :width="size" contain :height="size" src="@/assets/metamask-logo.svg"/>
    <v-img v-if="!useBig && walletType === WalletEnum.coinbase" :width="size" contain :height="size" src="@/assets/coinbase-logo.svg"/>
    <v-img v-if="!useBig && walletType === WalletEnum.walletConnect" :width="size" contain :height="size" src="@/assets/walletconnect-logo.svg"/>
    <v-img v-if="useBig && walletType === WalletEnum.metamask" :height="size" contain src="@/assets/metamask.svg"/>
    <v-img v-if="useBig && walletType === WalletEnum.coinbase" :height="size" contain src="@/assets/coinbase.svg"/>
    <v-img v-if="useBig && walletType === WalletEnum.walletConnect" :height="size" contain src="@/assets/walletconnect.svg"/>
  </div>
</template>

<script lang="ts">
import { WalletEnum } from "../../../../interfaces";
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class WalletLogo extends Vue{
  WalletEnum = WalletEnum;

  @Prop({default: WalletEnum.none}) readonly walletType!: WalletEnum;
  @Prop({default: 45}) readonly size!: number;
  @Prop({default: false}) readonly useBig!: boolean;
}
</script>
