<template lang="html">
  <nav class="nav-main">
    <router-link v-for="route in routesToDisplay" :key="route.path" class="nav-main__item" :to="route.path">
      {{ route.text }}
    </router-link>
  </nav>
</template>

<script lang="ts">
import CommonStore from "@/store/common.store";
import WalletStore from "@/store/wallet.store";
import {Component, Vue} from "vue-property-decorator";
import {AdminRole} from "@/interfaces";

@Component
export default class Navigation extends Vue {
  Routes = [
    {
      path: "/portfolio",
      text: "Portfolio"
    },
    {
      path: "/rebalancer",
      text: "Rebalancer"
    },
    {
      path: "/celo",
      text: "Celo dashboard"
    },
    {
      path: "/admin",
      text: "Admin dashboard"
    }
  ];

  get routesToDisplay() {
    return this.Routes.filter((route) => {
      switch (route.path) {
        case "/admin":
          return this.adminRole === AdminRole.ADMIN;
        case "/rebalancer":
        case "/portfolio":
          return !this.newUser && this.walletConnected;
        case "/celo":
          return this.adminRole === AdminRole.ADMIN || this.adminRole === AdminRole.CELO;
        default:
          return false;
      }
    });
  }

  get newUser() {
    return CommonStore.newUser;
  }

  get adminRole() {
    return CommonStore.adminRole;
  }

  get walletConnected() {
    return WalletStore.isAuthenticated;
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/mixins/breakpoints.mixins";
@import "@/styles/variables";

.nav-main {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-left: $theme-unit * 5;

  &__item {
    text-align: left;
    text-decoration: none;
    font-size: $font-md;
    margin: 0 $theme-unit;
    color: $primary-light;
    border-radius: 100px;
    padding: $theme-unit * 1.2 $theme-unit * 2;

    &.router-link-active,
    &:hover {
      background-color: rgba(#fff, 0.1);
    }
  }
}
</style>
