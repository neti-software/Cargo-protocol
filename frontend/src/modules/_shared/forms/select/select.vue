<template>
  <div class="dropdown">
    <v-btn
        class="dropdown__toggle dropdown__toggle--button"
        v-if="!isMobile"
        @click="toggle"
        rounded
        :width="widthParsed"
        :height="height"
        elevation="0"
        size="large"
        :color="mainColor"
        v-bind:style="{borderColor}"
        :outlined="isOutlined">
      {{ value.name }}
      <v-icon class="dropdown__icon" v-bind:class="{'dropdown__icon--opened': opened}">mdi-chevron-down</v-icon>
    </v-btn>
    <div class="dropdown__toggle--select">
      <select class="minimal" @change="mobileSelectChanged">
        <option :selected="value.id === item.id" v-for="(item, index) of items" v-bind:key="`${item.id}_${index}`"
                :value="item.id">{{ item.name }}
        </option>
      </select>
    </div>
    <transition name="modal">
      <div v-if="opened"
           v-click-outside="closeOutside"
           class="dropdown__modal">
        <v-card
            rounded
            elevation="10">
          <div class="dropdown__modal--search" v-if="search">
            <div class="dropdown__modal--search-hider"></div>
            <v-text-field
                v-model="query"
                append-icon="mdi-magnify"
                full-width
                placeholder="Search platform"
                outlined
                rounded
                dense
                hide-details
            ></v-text-field>
          </div>
          <div class="dropdown__modal--items">
            <div class="dropdown__modal--item font--regular"
                 v-for="item in displayItems" v-bind:key="item.id"
                 v-bind:class="{'active': value.id === item.id}"
                 @click="valueChanged(item)">
              {{ item.name }}
            </div>
            <div class="dropdown__modal--item font--regular not-hoverable"
                 v-if="!!query && !displayItems.length">
              Nothing to show
            </div>
          </div>
        </v-card>

      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import {Component, Emit, Prop, Vue} from "vue-property-decorator";
import {Filter} from "@/interfaces";
import UserAgentService from "@/services/user-agent.service";

@Component
export default class AppSelect extends Vue {
  @Prop() name?: string;
  @Prop() value?: Filter;
  @Prop({default: false}) outlined!: boolean;
  @Prop({default: false}) search!: boolean;
  @Prop({default: false}) simpleReturn!: boolean;
  @Prop({default: false}) mobileFullWidth!: boolean;
  @Prop({default: 'primary'}) color!: string;
  @Prop({default: 200}) width!: number;
  @Prop({default: 50}) height!: number;
  @Prop({required: true}) items!: Filter[];


  private opened = false;
  private query = '';

  created () {
    window.addEventListener('scroll', this.onScroll);
  }

  destroyed() {
    window.removeEventListener('scroll', this.onScroll);
  }

  onScroll() {
    this.opened = false;
  }

  toggle() {
    this.query = '';
    this.opened = !this.opened;
  }

  closeOutside() {
    if (this.opened) {
      this.opened = !this.opened;
    }
  }

  mobileSelectChanged(event: any) {
    const item = this.items.find(item => item.id === event.target.value);
    this.$emit('input', item);
  }

  @Emit('input')
  valueChanged() {
    this.toggle();
  }

  get isMobile() {
    return UserAgentService.isMobile();
  }

  get isOutlined() {
    return !this.opened && this.outlined;
  }

  get mainColor() {
    return this.opened ? this.color : '#1E1E1E';
  }

  get borderColor() {
    return this.opened ? this.color : '#D5D6DF';
  }

  get widthParsed() {
    if (this.mobileFullWidth && !this.$vuetify.breakpoint.smAndUp) {
      return '100%';
    }
    return this.width;
  }

  get displayItems() {
    if (!this.search) {
      return this.items;
    }
    return this.items.filter(i => i.name.toLowerCase().indexOf(this.query.toLowerCase()) > -1);
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";ś
@import "@/styles/mixins/breakpoints.mixins";

.modal-enter-active {
  animation: slideInTopBounce .3s;
  transition: all 0.2s ease-out;
}

.modal-leave-active {
  animation: slideOutTop .3s forwards;
  transition: all 0.2s ease-in;
}


.v-btn__content {
  justify-content: flex-start;
}

.dropdown {
  position: relative;


  &__icon {
    position: absolute;
    right: -5px;
    color: #D5D6DF !important;
    transition: all 200ms;

    &--opened {
      transform: rotate(180deg);
    }
  }

  &__toggle {
    z-index: 2;

    &--button {
      display: none;
      @include respond-to('small') {
        display: block;
      }
    }
    &--select {
      @include respond-to('small') {
        display: none;
      }

      width: 100%;

      select {

        /* styling */
        background-color: transparent;
        color: $primary;
        border: $border;
        border-radius: $border-radius;
        display: inline-block;
        font: inherit;
        line-height: 1.5em;
        padding: 0.5em 3.5em 0.5em 1em;
        width: 100%;
        height: 50px;
        /* reset */

        margin: 0;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        -webkit-appearance: none;
        -moz-appearance: none;
      }


      select.minimal {
        background-image:
            linear-gradient(45deg, transparent 50%, gray 50%),
            linear-gradient(135deg, gray 50%, transparent 50%);
        background-position:
            calc(100% - 20px) calc(1em + 5px),
            calc(100% - 15px) calc(1em + 5px),
            calc(100% - 2.5em) 0.5em;
        background-size:
            5px 5px,
            5px 5px,
            1px 1.5em;
        background-repeat: no-repeat;
      }
    }
  }

  &__modal {
    position: absolute;
    z-index: 3;

    &--search {
      padding: 15px 15px 0;
      position: relative;

      &-hider {
        position: absolute;
        bottom: -15px;
        right: 0;
        left: 0;
        height: 15px;
        background: linear-gradient(rgba(255, 255, 255, 1), rgba(255, 255, 255, .4));;
      }
    }

    &--items {
      padding: 15px 0;
      max-height: 320px;
      overflow: scroll;
    }

    &--item {
      width: 300px;
      padding: 10px 17px;

      &:not(.not-hoverable):hover,
      &.active {
        cursor: pointer;
        background-color: $primary-light;
        color: $primary;
      }
    }
  }

}
</style>
