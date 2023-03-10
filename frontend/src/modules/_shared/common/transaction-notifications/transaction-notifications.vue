<template>
  <div>
    <v-snackbar
      v-for="(notification, index) in notifications"
      :key="index"
      v-model="notification.show"
      :color="notification.color"
      class="notification"
      @input="clear(notification.id, index)"
      :timeout="notification.txHash !== '' ? 10000 : 5000"
      :multi-line="true"
      bottom
      right
      elevation="1"
      max-width="none"
    >
      <div class="notification__content">
        <v-icon class="mr-5">{{ notification.icon }}</v-icon>

        <div class="notification__text">
          <p :class="[notification.txHash ? 'notification__text--header' : 'notification__text--message']">
            {{ notification.message }}
          </p>

          <div v-if="notification.assets" class="notification__assets">
            <p class="notification__assets--text mt-5">
              Token1:
              {{ notification.assets.token0Amount }}
              {{ notification.assets.token0Name }}
            </p>

            <p class="notification__assets--text">
              Token2:
              {{ notification.assets.token1Amount }}
              {{ notification.assets.token1Name }}
            </p>
          </div>

          <p v-if="notification.gasUsed" class="notification__text--gas mb-2">Gas used by transaction: {{ notification.gasUsed }} CELO</p>

          <v-btn v-if="notification.txHash" text @click="runExplorer(notification.txHash)" class="ma-0 pa-0 mr-5" id="no-background-hover">
            View on explorer
          </v-btn>
        </div>
      </div>
      <template v-slot:action="{attrs}">
        <v-btn text v-bind="attrs" @click="clear(notification.id, index)" class="notification__clear mr-1" x-small icon
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Watch} from "vue-property-decorator";
import CommonStore from "@/store/common.store";
import explorers from "@/assets/web3/explorers.json";

@Component
export default class TransactionNotifications extends Vue {
  public notifications = CommonStore.transactionNotifications;

  clear(id: number, index: number) {
    this.notifications.splice(index, 1);
    setTimeout(() => {
      CommonStore.setTransactionIsActive(false);
    }, 100);
  }

  async runExplorer(tx: string) {
    const network = await CommonStore.provider.getNetwork();
    const chainId = network.chainId as "42220" | "44787";
    window.open(`${explorers[chainId]}\\tx\\${tx}`);
  }

  @Watch("notifications")
  stackSnackbars(val: []) {
    if (val.length > 1) {
      this.notifications.splice(0, 1);
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/styles/variables";
@import "src/styles/mixins/breakpoints.mixins";

.notification {
  padding: 2em;

  &__content {
    display: flex;
  }

  &__clear {
    position: absolute;
    right: $theme-unit;
    top: 50%;
    transform: translateY(-50%);
  }

  &__text {
    &--header {
      margin: 5px 30px 0 0;
    }

    &--message {
      margin: 2px 30px 0 0;
    }

    &--gas {
      margin: 0 30px 15px 0;
    }
  }

  &__assets {
    &--text {
      margin: 0 30px 0 0;
    }
  }
}

::v-deep .v-snack__content {
  word-break: break-word;
}

#no-background-hover::before {
  background-color: transparent !important;
}
</style>
