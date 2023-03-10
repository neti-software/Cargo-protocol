<template>
  <div class="cargo-logo-main" @click="logoClick">
    <img alt="logo" :height="size" src="@/assets/cargo-logo.svg" />
    <h1 v-if="showHeader">Cargo</h1>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class CargoLogo extends Vue {
  @Prop({default: 45}) readonly size!: number;
  @Prop({default: false}) readonly useBig!: boolean;
  @Prop({default: true}) readonly showHeader!: boolean;

  private logoClick() {
    this.$emit("click");
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables";
.cargo-logo-main {
  display: flex;
  flex-direction: row;
  align-items: center;
  user-select: none;
  gap: $theme-unit;
  font-size: $font-sm;
}
</style>
