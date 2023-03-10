<template>
  <transition name="nav-animation">
    <div :class="`nav ${opened && 'backdrop'}`">
      <v-card class="nav__content py-4" v-click-outside="close" v-if="opened" elevation="3" v-bind:style="{left, width}">
        <v-btn @click="close" class="nav-btn mb-3" elevation="0" block :to="{name: 'rebalancer-main'}">
          <span>Rebalancer</span>
          <v-icon class="addon">mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn @click="close" class="nav-btn" elevation="0" block :to="{path: 'portfolio'}">
          <span>Portfolio</span>
          <v-icon class="addon">mdi-chevron-right</v-icon>
        </v-btn>
      </v-card>
    </div>
  </transition>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component({})
export default class PhoneNavigation extends Vue {
  public opened = false;
  public left = "0";
  public width = "0";

  created() {
    window.addEventListener("resize", this.calcWidthAndLeft);
    window.addEventListener("scroll", this.close);
  }

  destroyed() {
    window.removeEventListener("resize", this.calcWidthAndLeft);
    window.removeEventListener("scroll", this.close);
  }

  open() {
    if (!this.opened) {
      this.opened = true;
      this.calcWidthAndLeft();
    }
  }

  calcWidthAndLeft() {
    if (this.opened) {
      if (window.innerWidth < 550) {
        const witdh = 90;
        this.width = witdh + "%";
        this.left = `${(window.innerWidth - (witdh / 100) * window.innerWidth) / 2}px`;
      } else {
        const witdh = 60;
        this.width = witdh + "%";
        this.left = "32px";
      }
    }
  }

  close() {
    if (this.opened) {
      this.opened = false;
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/styles/variables";
@import "src/styles/mixins/breakpoints.mixins";

.nav-animation {
  animation: fadeOutDown 0.3s forwards;
  transition: all 0.2s ease-in;
}

.nav {
  max-height: 100%;
  max-width: 100%;
  overflow: hidden;

  &__content {
    position: fixed;
    max-height: 100%;
    top: 0;
    overflow: hidden;
    animation: bounceInLeft 0.4s ease-out 0s 1 forwards;
    -webkit-animation: bounceInLeft 0.4s ease-out 0s 1 forwards;
    -moz-animation: bounceInLeft 0.4s ease-out 0s 1 forwards;
    z-index: 10;
    margin: 100px 0;

    & .nav-btn {
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding-top: 3 * $theme-unit;
      padding-bottom: 3 * $theme-unit;

      .v-icon {
        margin-right: $theme-unit;
      }
    }
  }
}
</style>
