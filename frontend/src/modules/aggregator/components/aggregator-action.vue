<template>
  <v-card elevation="0"
          rounded
          class="aggregator-action"
          v-bind:class="{'disabled': disabled}"
          @click="actionClicked">
    <div class="aggregator-action__title">
      <slot name="title"></slot>
    </div>
    <div class="aggregator-action__subtitle">
      <slot name="subtitle"></slot>
    </div>
    <v-spacer/>
    <div class="aggregator-action__not-available">
      <div v-if="disabled" class="d-flex align-end">
        <v-icon class="aggregator-action__not-available--icon">mdi-lock</v-icon>
        <slot name="disabled-text">
          Under construction
        </slot>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import {Vue, Component, Prop} from "vue-property-decorator";

@Component
export default class AggregatorAction extends Vue {
  @Prop({default: false}) disabled!: boolean;

  public actionClicked() {
    if (!this.disabled) {
      this.$emit('click');
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables";

.aggregator-action {
  border: 3px solid transparent;
  padding: 2 * $theme-unit;
  display: flex;
  flex-direction: column;
  background: #383838 !important;

  &:not(.disabled):hover {
    border: 3px solid $primary;
  }

  &__title {
    font-size: $font-lg;
    margin-bottom: $theme-unit;
  }

  &__subtitle {
    font-size: $font-sm;
    margin-bottom: $theme-unit;
    color: $sub-text-color;
  }

  &__not-available {
    justify-self: flex-end;
    margin-top: $theme-unit;
    color: $sub-text-color;
  }

  &.disabled {
    cursor: default;
    pointer-events: none !important;
  }
}

</style>