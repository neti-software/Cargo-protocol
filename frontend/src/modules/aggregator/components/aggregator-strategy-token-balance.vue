<template>
  <div
    class="token-balance flex-fill"
    :style="{
      backgroundImage: background
    }"
  >
    <div
      class="token-balance__value"
      v-bind:style="{
        width: `${value0}%`,
        color: '#2b2b2b',
        'min-width': '23%'
      }"
    >
      {{ token0Text }}
    </div>
    <div
      class="token-balance__value"
      v-bind:style="{
        width: `${100 - value0}%`,
        color: '#2b2b2b',
        'min-width': '23%'
      }"
    >
      {{ token1Text }}
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop} from "vue-property-decorator";

@Component
export default class AggregatorStrategyTokenBalance extends Vue {
  @Prop({required: true}) token0Value!: number;
  @Prop({required: true}) token1Value!: number;
  @Prop({required: true}) token0Text!: string;
  @Prop({required: true}) token1Text!: string;
  @Prop({required: true}) token0Color!: string;
  @Prop({required: true}) token1Color!: string;

  get value0() {
    const max = this.token0Value + this.token1Value;

    return Math.round((this.token0Value / max) * 100);
  }

  get background() {
    let value = this.value0;
    if (value === 1) {
      return this.token0Color;
    }
    if (value === 100) {
      return this.token1Color;
    }
    if (value >= 95) {
      value = 95;
    }

    const firstStop = `${this.token0Color} ${value - 1}%,`;
    const secondStop = `${this.token1Color} ${value + 1}%,`;

    const gradient = "linear-gradient(90deg," + this.token0Color + "," + firstStop + secondStop + this.token1Color;
    return gradient;
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables";
@import "@/styles/mixins/breakpoints.mixins.scss";

.token-balance {
  border-radius: $border-radius;
  clip-path: border-box;
  display: flex;
  align-items: center;
  height: 4 * $theme-unit;

  @include respond-to("small") {
    margin-left: 2 * $theme-unit;
    margin-right: 2 * $theme-unit;
  }

  &__value {
    text-align: center;
    overflow: hidden;
  }
}
</style>
