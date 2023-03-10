<template>
  <div class="repay-reinvest">
    <v-slider
        class="repay-reinvest__slider"
        v-model="repayPercentage"
        track-color="grey"
        hide-details
        always-dirty
        :min="0"
        :max="100"
        @change="repayPercentageChanged"
    >
      <template v-slot:prepend>
        <div class="repay-reinvest__slider--label" v-bind:class="{'editable': labelEditable}">
          <div>Repay</div>
          <div class="label-percent" @click="setEditor('repay')">
            {{ 100 - repayPercentage }}%
            <v-icon small>mdi-pencil</v-icon>
          </div>
        </div>
      </template>
      <template v-slot:append>
        <div class="repay-reinvest__slider--label" v-bind:class="{'editable': labelEditable}">
          <div>Reinvest</div>
          <div class="label-percent" @click="setEditor('reinvest')">
            {{ repayPercentage }}%
            <v-icon small>mdi-pencil</v-icon>
          </div>
        </div>
      </template>
    </v-slider>

    <div class="repay-reinvest__input" v-bind:class="[this.inputOpened]">
      <v-btn icon color="black" @click="setEditor('none')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-text-field
          v-model="inputModel"
          :type="isPhone ? 'tel' : 'number'"
          ref="input-modal"
          @keydown="filterInput"
          @keydown.enter="saveEditor"
          @keydown.esc="setEditor('none')"
          :rules="[() => +inputModel <= 100 && +inputModel >= 0 || 'Wrong range']"
          :label="inputOpened.toUpperCase()"
          outlined
          rounded
          hide-details
      ></v-text-field>
      <v-btn icon color="primary" @click="saveEditor">
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </div>
  </div>

</template>

<script lang="ts">
import {Component, Emit, Prop, Vue, Watch, Ref} from "vue-property-decorator";
import UserAgentService from "@/services/user-agent.service";

@Component
export default class RepayReinvestSlider
    extends Vue {

  @Prop() value?: number;
  @Prop({default: false}) labelEditable!: boolean;
  @Ref('input-modal') inputModal!: HTMLElement

  private repayPercentage = 50;
  private inputModel: string = '';
  private isPhone = false;
  private inputOpened: 'repay' | 'reinvest' | 'none' = 'none';

  created() {
    this.repayPercentage = this.value || 0;
    this.isPhone = UserAgentService.isMobile();
  }

  @Emit('input')
  repayPercentageChanged(value: number) {
    this.repayPercentage = value;
  }

  @Watch('value')
  valueChangedOutside(value: number) {
    this.repayPercentage = value;
  }

  setEditor(side: 'repay' | 'reinvest' | 'none') {
    if (this.labelEditable) {

      switch (side) {
        case "repay":
          setTimeout(() => {
            this.inputModel = (100 - this.repayPercentage).toString();
          }, 250)
          setTimeout(() => {
            this.inputModal.focus();
          }, 500)
          break;
        case "reinvest":
          setTimeout(() => {
            this.inputModel = this.repayPercentage.toString();
          }, 250)
          setTimeout(() => {
            this.inputModal.focus();
          }, 500)
          break;
        case "none":
          this.inputModel = '';
          break;
      }
      this.inputOpened = side;
    }
  }

  saveEditor() {
    switch (this.inputOpened) {
      case "repay":
        this.repayPercentage = 100 - +this.inputModel
        break;
      case "reinvest":
        this.repayPercentage = +this.inputModel
        break;
      case "none":
        break;
    }

    this.setEditor('none');
  }

  filterInput(e: KeyboardEvent) {
    const isSpecialKeys = e.ctrlKey || e.metaKey;
    const isDelete = e.code.toLowerCase() === 'backspace' || e.code.toLowerCase() === 'delete';
    if (!isSpecialKeys && !isDelete && !/^[0-9]|\./.test(e.key)) {
      e.preventDefault();
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";ś
@import "@/styles/mixins/breakpoints.mixins";

.repay-reinvest {
  padding: 4px;
  position: relative;

  &__slider {
    &--label {
      display: flex;
      flex-direction: column;
      gap: 2px;
      text-align: center;
      min-width: 65px;

      .label-percent {
        display: flex;
        border-bottom: 1px solid transparent;
        flex-direction: row;
        align-items: flex-end;
        justify-content: center;
        gap: 2px;

        .v-icon {
          display: none;
        }
      }

      &.editable {
        .label-percent {

          &:hover {
            border-bottom: 1px solid $primary;
            color: $primary;
            cursor: pointer;

            .v-icon {
              color: $primary;
            }
          }

          .v-icon {
            display: inline-block;
          }
        }
      }
    }
  }

  @keyframes openEditor {
    0% {
      width: 5px;
      opacity: 0;
    }
    100% {
      width: 100%;
      opacity: 1;
    }
  }

  &__input {
    position: absolute;
    padding-left: $theme-unit;
    padding-right: $theme-unit;
    display: none;
    background: white;
    border-radius: $border-radius;
    width: 5px;
    transition: all 500ms;
    bottom: 0;
    opacity: 0;

    &.repay,
    &.reinvest {
      display: flex;
      align-items: center;

      animation: openEditor .2s cubic-bezier(1.0, 0.5, 0.8, 1.0) 0s 1 forwards;
      -webkit-animation: openEditor .2s cubic-bezier(1.0, 0.5, 0.8, 1.0) 0s 1 forwards;
      -moz-animation: openEditor .2s cubic-bezier(1.0, 0.5, 0.8, 1.0) 0s 1 forwards;
    }

    &.repay {
      left: 0;
    }
    &.reinvest {
      right: 0;
    }
  }
}

</style>
