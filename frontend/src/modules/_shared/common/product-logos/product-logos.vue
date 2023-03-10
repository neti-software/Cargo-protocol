<template>
  <div class="logo-wrapper" v-bind:style="wrapperStyle">
    <v-img v-for="(logo, index) of logoUrls"
           v-bind:key="`${componentId}_${index}`"
           v-bind:style="{
             'margin-left': `${index * (isXDirection ? offset : 0)}px`,
             'margin-top': `${index * (isYDirection ? offset : 0)}px`,
             height: sizePx,
             width: sizePx
           }"
           class="logo"
           :src="logo"></v-img>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";

@Component
export default class ProductLogos extends Vue {
  public componentId: number;
  @Prop({required: true}) logos!: string[];
  @Prop({required: true}) offset!: number;
  @Prop({required: true}) size!: number;
  @Prop({default: 0}) top!: number;
  @Prop({default: 0}) left!: number;
  @Prop({default: true}) absolute!: boolean;
  @Prop({default: 'x'}) direction!: 'x' | 'y' | 'xy';

  constructor() {
    super();
    this.componentId = Math.random();
  }

  get sizePx() {
    return `${this.size}px`;
  }

  get logoUrls() {
    if (!this.logos) {
      return [];
    }
    return this.logos.map(item =>
        item.startsWith('http') ? item :
            `https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_${item}.png`
    );
  }

  get isXDirection() {
    return this.direction.indexOf('x') >=0;
  }

  get isYDirection() {
    return this.direction.indexOf('y') >=0;
  }

  get wrapperStyle() {
    if (this.absolute) {
      return { 'left': `${this.left}px`, 'top': `${this.top}px`, 'position': 'absolute', 'width': `${this.size * this.logos.length}px`}
    }
    const width = this.size + this.offset * (this.isXDirection ? this.logos.length - 1 : 0)
    const height = this.size + this.offset * (this.isYDirection ? this.logos.length - 1 : 0)
    return { 'height': `${height}px`, 'width': `${width}px`, 'position': 'relative'}
  }

}
</script>

<style scoped lang="scss">
.logo {
  position: absolute;
  border: 3px solid white;
  box-shadow: 0 0 5px 0 #d3d3d3;
  background-color: white;
  border-radius: 50%;
  top: 0;
  left: 0;
}
</style>
