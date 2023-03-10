<template>
  <v-layout fill-height v-if="!wrongWalletNetwork">
    <router-view></router-view>
  </v-layout>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import CommonStore from "@/store/common.store";

@Component
export default class Celo extends Vue {
  get wrongWalletNetwork() {
    return CommonStore.wrongWalletNetwork;
  }
}
</script>
