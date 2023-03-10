<template>
  <div class="asset-cards">
    <div class="asset-cards__header">Assets</div>
    <div class="asset-cards__list">
      <transition name="fade" mode="out-in">
        <div v-if="assetSelected">
          <v-card elevation="0" rounded @click="selectAsset()" style="height: 100%">
            <div class="asset-cards__content back">
              <div>
                <v-icon>mdi-chevron-left</v-icon>
              </div>
              <div class="font--regular font--bold">All assets</div>
            </div>
          </v-card>
        </div>
      </transition>
      <v-card
        v-for="asset of assets"
        :key="asset.address"
        elevation="0"
        rounded
        @click="selectAsset(asset)"
        :class="{selected: currentAssetId === asset.address}"
        :disabled="disabledAssetAddresses.includes(asset.address)"
      >
        <div class="asset-cards__content">
          <div>
            <product-logos :logos="[asset.name]" :absolute="false" :offset="15" :size="35" />
          </div>
          <div>
            <div class="font--sm">{{ asset.myAmount }}</div>
            <div class="font--regular font--bold">{{ asset.name }}</div>
          </div>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import {Token} from "@/interfaces";
import ProductLogos from "@/modules/_shared/common/product-logos/product-logos.vue";
import StringService from "@/services/string.service";
import AssetsStore from "@/store/assets.store";

@Component({
  components: {ProductLogos}
})
export default class AssetFilter extends Vue {
  @Prop({
    required: false,
    default() {
      return [];
    }
  })
  public disabledAssetAddresses!: string[];
  private currentAssetId = "";

  async mounted() {
    if (this.$route.query["asset"]) {
      this.currentAssetId = this.$route.query["asset"] as string;
    } else {
      this.currentAssetId = "";
    }
  }

  get assets() {
    return AssetsStore.assets;
  }

  get assetSelected() {
    return !StringService.isNullOrWhitespace(this.currentAssetId);
  }

  selectAsset(asset?: Token) {
    this.currentAssetId = asset?.address || "";
    if (this.$route.query["asset"] && this.$route.query["asset"] === this.currentAssetId) return;
    this.$router.replace({query: asset && {asset: asset!.address}});
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.asset-cards {
  margin-bottom: $panel-gap * 2;

  &__header {
    font-size: $font-sm;
    line-height: $font-sm-line;
    padding-left: 2 * $theme-unit;
    margin-bottom: $theme-unit;
  }

  &__list {
    display: flex;
    gap: $theme-unit;

    overflow-x: scroll;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  ::v-deep.v-card {
    border: 2px solid transparent;
    clip-path: border-box;
    order: 2;

    &.selected {
      border: 2px solid $primary;
      background: #4f315d;
    }
  }

  &__content {
    min-width: 150px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: $theme-unit;

    &.back {
      height: 100%;
    }
  }
}
</style>
