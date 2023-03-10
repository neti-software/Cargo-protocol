<template>
  <div class="backdrop global-loader">
    <div class="global-loader__content">
      <loader :wallet-type="walletType" size="128" icon-size="80" />
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import ModalWrapper from "@/modules/_shared/modals/modal-wrapper/modal-wrapper.vue";
// import WalletStore from "@/store/wallet.store";
import Loader from "@/modules/_shared/common/loader/loader.vue";

@Component({
  components: {Loader, ModalWrapper}
})
export default class GlobalLoader extends Vue {
  @Prop({default: true}) isProviderSpecific!: boolean;

  get walletType() {
    return 0;
    // if (this.isProviderSpecific) {
    //   return WalletStore.currentProvider;
    // }
    // return null;
  }
}
</script>

<style scoped lang="scss">
.global-loader {
  pointer-events: none;
  &__content {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
  }
}
</style>
