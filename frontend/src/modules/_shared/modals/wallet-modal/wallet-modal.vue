<template>
    <modal-wrapper class="wallet-modal" :back-drop-close="true" @backdrop-click="close" :center="isMobile">
      <v-card class="modal-card" rounded outlined elevation="10">
        <div class="wallet-modal__header font--regular">
          <wallet-logo :wallet-type="provider" :use-big="true"/>
          {{ address }}
          <div class="wallet-modal__close" @click="close">
            <v-icon>mdi-close</v-icon>
          </div>
        </div>
        <v-btn class="mb-3" outlined large block color="black" @click="disconnect">
          <v-icon>mdi-logout</v-icon>
          Disconnect
        </v-btn>
      </v-card>
    </modal-wrapper>
</template>

<script lang="ts">
import {Component} from "vue-property-decorator";
import {mixins} from "vue-class-component";
import ModalWrapper from "@/modules/_shared/modals/modal-wrapper/modal-wrapper.vue";
import WalletStore from "@/store/wallet.store";
import WalletLogo from "@/modules/_shared/common/wallet-logo/wallet-logo.vue";
import WalletAuthService from "@/services/wallet-auth.service";
import ModalMixin from "@/modules/_shared/modals/modal-mixin.vue";
import AuthTokenPersistentStorageService from '@/services/persistent-storage/auth-token.service';

@Component({
  components: {WalletLogo, ModalWrapper}
})
export default class WalletModal extends mixins(ModalMixin) {

  get address() {
    return WalletStore.currentAddress;
  }

  get provider() {
    return WalletStore.currentProvider
  }

  disconnect() {
    this.close();
    AuthTokenPersistentStorageService.clear();
    WalletAuthService[WalletStore.currentProvider].disconnect();
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.wallet-modal {
  &__close {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 15px;
    height: 15px;
    cursor: pointer;
    opacity: 0.7;
    transition: all 100ms;

    &:hover {
      opacity: 1;
    }
  }

  &__header {
    padding: 0 0 $theme-unit * 2;
  }

  &__actions {
    display: flex;
    margin-top: 20px;
    align-items: baseline;
    gap: 20px;
  }

  .v-card {
    width: 1200px;
    padding: $panel-gap $panel-gap 5px $panel-gap;
  }
}
</style>
