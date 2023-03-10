<template>
  <v-layout class="admin" fill-height>
    <router-view></router-view>
  </v-layout>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import CommonStore from "@/store/common.store";
import AdminsStore from "@/store/admins.store";
import UniswapV3Service from "@/services/uniswapV3.service";

@Component
export default class Admin extends Vue {
  async created() {
    CommonStore.saveAdminMode(true);
    if (AdminsStore.admins.length === 0) await UniswapV3Service.fetchAdminData();
  }

  async destroyed() {
    CommonStore.saveAdminMode(false);
    if (AdminsStore.admins.length > 0) await AdminsStore.cleanAdmins();
  }
}
</script>

<style lang="scss">
.actions {
  animation: fadeIn 0.2s ease-out 0s 1 forwards;
  -webkit-animation: fadeIn 0.2s ease-out 0s 1 forwards;
  -moz-animation: fadeIn 0.2s ease-out 0s 1 forwards;
}

.delete-confirm__timeout {
  position: absolute;
  bottom: -4px;
}
</style>
