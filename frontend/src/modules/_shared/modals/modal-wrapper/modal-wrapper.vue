<template lang="html">
  <transition name="modal-animation">
    <div class="modal backdrop" @keydown.esc="keyPressed" v-bind:class="{'big-modal': bigModal}">
      <div class="modal__content"
           v-if="center === false"
           v-bind:style="{maxWidth: maxWidthParsed, minWidth: minWidthParsed, right, width}">
        <div v-click-outside="handleClick">
          <slot></slot>
        </div>
      </div>
      <div class="modal__content--center"
           v-if="center === true"
           v-bind:style="{maxWidth: maxWidthParsed, minWidth: minWidthParsed, width}">
        <div v-click-outside="handleClick">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-property-decorator";
import CommonStore from "@/store/common.store";

@Component
export default class ModalWrapper extends Vue {
  @Prop({default: false}) backDropClose!: boolean;
  @Prop({default: false}) escapeClose!: boolean;
  @Prop({default: false}) center!: boolean;
  @Prop({default: false}) fullWidth!: boolean;
  @Prop({default: false}) bigModal!: boolean;
  @Prop({default: 450}) maxWidth!: number;
  @Prop({default: 350}) minWidth!: number;

  public right = '0';

  @Emit() backdropClick() {
  }

  @Emit() escapeClick() {
  }

  created() {
    document.addEventListener('keydown', this.keyPressed);
    window.addEventListener('resize', this.calcRight);
    this.calcRight();
  }

  destroyed() {
    document.removeEventListener('keydown', this.keyPressed);
    window.removeEventListener('resize', this.calcRight);
  }

  calcRight() {
    this.right = window.innerWidth > 1920 ? `${(window.innerWidth - 1920) / 2 + 15}px` : '0'
  }

  handleClick() {
    if (this.backDropClose && !CommonStore.transactionIsActive) {
      this.backdropClick();
    }
  }

  keyPressed(e: KeyboardEvent) {
    if (this.escapeClose) {
      if (e.code.toLowerCase() === 'escape') {
        this.escapeClick();
      }
    }
  }

  get maxWidthParsed() {
    return `${this.maxWidth}px`;
  }

  get minWidthParsed() {
    return `${this.minWidth}px`;
  }

  get width() {
    return this.fullWidth ? '100%' : 'auto';
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";
@import "@/styles/mixins/breakpoints.mixins";

.modal-animation-leave-active {
  animation: fadeOutDown .3s forwards;
  transition: all 0.2s ease-in;

  @include respond-to('small') {
    animation: fadeOut .3s forwards;
    transition: all 0.2s ease-in;
  }
}

@keyframes bounceInRightToCenter {
  0% {
    opacity: 0;
    transform: translate3d(3000px, -50%, 0) scaleX(3);
  }

  60% {
    opacity: 1;
    transform: translate3d(-55%, -50%, 0) scaleX(1);
  }

  75% {
    transform: translate3d(-47%, -50%, 0) scaleX(0.98);
  }

  90% {
    transform: translate3d(-52%, -50%, 0) scaleX(0.995);
  }

  to {
    transform: translate3d(-50%, -50%, 0);
  }
}

@mixin modalBigAnimations() {
  .modal__content {
    top: 65px;
    right: 0;
    max-width: none;
    bottom: auto;
    left: auto;
    padding: $panel-gap;
    animation: bounceInRight .5s ease-out 0s 1 forwards;
    -webkit-animation: bounceInRight .5s ease-out 0s 1 forwards;
    -moz-animation: bounceInRight .5s ease-out 0s 1 forwards;

    &--center {
      top: 50%;
      left: 50%;
      max-width: none;
      bottom: auto;
      right: auto;
      transform: translate(-50%, -50%);
      animation: bounceInRightToCenter .5s cubic-bezier(0.215, 0.61, 0.355, 1) 0s 1 forwards;
      -webkit-animation: bounceInRightToCenter .5s cubic-bezier(0.215, 0.61, 0.355, 1) 0s 1 forwards;
      -moz-animation: bounceInRightToCenter .5s cubic-bezier(0.215, 0.61, 0.355, 1) 0s 1 forwards;
    }
  }
  .modal__content,
  .modal__content--center {
    ::v-deep {
      .v-card.modal-card {
        border-radius: $border-radius !important;
      }
    }

  }
}

.modal {
  max-height: 100%;
  max-width: 100%;
  overflow: hidden;

  &__content,
  &__content--center {
    position: fixed;
    width: 100%;
    max-height: 100%;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    animation: bounceInUp .4s ease-out 0s 1 forwards;
    -webkit-animation: bounceInUp .4s ease-out 0s 1 forwards;
    -moz-animation: bounceInUp .4s ease-out 0s 1 forwards;

    ::v-deep {
      .v-card.modal-card {
        border-radius: 0 !important;
      }
    }
  }
}

@include respond-to('small') {
  .modal:not(.big-modal) {
    @include modalBigAnimations();
  }
}

@include respond-to('medium') {
  .modal.big-modal {
    @include modalBigAnimations();
  }
}

</style>
