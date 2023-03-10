<template>
  <v-app>
    <router-view />
    <transaction-notifications />
  </v-app>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import TransactionNotifications from "@/modules/_shared/common/transaction-notifications/transaction-notifications.vue";

@Component({
  components: {TransactionNotifications}
})
export default class AppComponent extends Vue {}
</script>
