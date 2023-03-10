<template>
  <div class="data-row">
    <div class="data-row__text">
      {{name}}
      <v-tooltip right max-width="300" color="primary" v-if="help">
        <template v-slot:activator="{ on, attrs }">
          <v-icon class="ml-1" small color="primary" v-bind="attrs" v-on="on">mdi-help-circle</v-icon>
        </template>
        <p class="mb-2">{{ help.text }}</p>
        <p class="font--bold font--spaced">{{ help.strong }}</p>
      </v-tooltip>
    </div>
    <div class="data-row__text text--right" v-bind:class="[fontColor, {'highlight-text': dataChanges}]">
      <span>{{data}}</span><span class="ml-1" v-if="suffix">{{suffix}}</span>
    </div>
  </div>

</template>

<script lang="ts">
import {Component, Prop, Vue, Watch} from "vue-property-decorator";
import {DataExplanation} from "@/interfaces";

@Component
export default class DataRow extends Vue {

  @Prop({default: false}) highlightChanges!: boolean;
  @Prop({default: '#F5F7FB'}) hoverColor!: string;
  @Prop({default: 'default'}) type!: 'default' | 'info' | 'success' | 'warning' | 'error';
  @Prop({required: true}) name!: string;
  @Prop({required: false}) suffix!: string;
  @Prop({required: true}) data!: any;

  @Prop() help?: DataExplanation;

  private dataChanges = false;
  private prevData: any | undefined = undefined;

  @Watch('data')
  borrowDataChanged(next: any) {
    if (this.highlightChanges) {
      if (this.prevData) {
        if (this.prevData !== next) {
          this.dataChanges = true;
        }
      }
      this.prevData = next;
      setTimeout(() => {
        this.dataChanges = false;
      }, 2000);
    }
  }

  get fontColor() {
    return [`color--${this.type}`, this.type !=='default' ? 'font--bold': ''];
  }

}
</script>

<style scoped lang="scss">
@import "src/styles/variables";
@import "src/styles/mixins/breakpoints.mixins";

@keyframes highlight-row {
  0% {
    background-color: $info;
  }
  100% {
    background-color: transparent;
  }
}

@keyframes highlight-text {
  0% {
    color: $primary;
  }
  50% {
    color: $primary;
  }
  100% {
    color: $text-color;
  }
}

.data-row {
  display: flex;
  justify-content: space-between;
  padding: 4px;
  column-gap: 24px;
  flex-wrap: wrap;
  border-radius: 4px;
  background-color: transparent;

  @include respond-to('small') {
    flex-wrap: nowrap;
  }

  &__text {
    display: flex;
    white-space: nowrap;
  }

  &:hover {
    background-color: var(--color-hover);
  }

  &.highlight-row {
    animation: highlight-row 1.5s ease-out 0s 1 forwards;
    -webkit-animation: highlight-row 1.5s ease-out 0s 1 forwards;
    -moz-animation: highlight-row 1.5s ease-out 0s 1 forwards;
  }
  .highlight-text {
    animation: highlight-text 1.5s ease-out 0s 1 forwards;
    -webkit-animation: highlight-text 1.5s ease-out 0s 1 forwards;
    -moz-animation: highlight-text 1.5s ease-out 0s 1 forwards;

  }
}

</style>
