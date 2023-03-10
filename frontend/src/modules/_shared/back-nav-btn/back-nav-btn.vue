<template>
  <v-btn class="back-button" @click="goBack" text large :block="block">
    <v-icon>mdi-chevron-left</v-icon>
    {{ label || "Back" }}
  </v-btn>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import CommonStore from "@/store/common.store";

@Component
export default class BackNavBtn extends Vue {
  @Prop() label?: string;
  @Prop() block?: boolean;
  @Prop() backLocationName?: string;

  goBack() {
    if (this.backLocationName) {
      return this.$router.replace({name: this.backLocationName});
    }
    if (CommonStore.history) {
      return this.$router.back();
    } else {
      const prevIdx = this.$route.matched.length - 2;
      const prev = this.$route.matched[prevIdx >= 0 ? prevIdx : 0];
      return this.$router.replace({name: prev.name, path: prev.path, replace: true});
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/styles/variables";
@import "src/styles/mixins/breakpoints.mixins";

.back-button {
  margin: 0 0 $theme-unit;

  &::v-deep.v-btn--block {
    .v-btn__content {
      justify-content: flex-start !important;
    }
  }
}
</style>
