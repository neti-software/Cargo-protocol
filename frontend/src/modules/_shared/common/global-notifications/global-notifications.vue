<template>
  <div>
    <div class="system-notification"
         v-for="(notification, index) of notifications"
         :key="notification.id"
         v-bind:class="[notification.type]">
      <div v-html="notification.message"></div>
      <v-btn v-if="!notification.persistent"
             @click="clear(notification.id, index)"
             class="system-notification__clear" x-small icon><v-icon>mdi-close</v-icon></v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import CommonStore from "@/store/common.store";

@Component
export default class GlobalNotifications extends Vue {

  public notifications = CommonStore.notifications;

  clear(id: string, index: number) {
    this.notifications.splice(index, 1);
    CommonStore.removeNotification(id);
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";
@import "@/styles/mixins/breakpoints.mixins";

.system-notification {
  position: relative;
  padding-left: $theme-unit;
  padding-right: $theme-unit;

  &__clear {
    position: absolute;
    right: $theme-unit;
    top: 50%;
    transform: translateY(-50%);
  }
}

</style>
