<template>
  <div>
    <back-nav-btn backLocationName="admin-networks" />
    <pools />
    <tokens class="mt-10" />
  </div>
</template>

<script lang="ts">
import {Vue, Component} from "vue-property-decorator";
import BackNavBtn from "@/modules/_shared/back-nav-btn/back-nav-btn.vue";
import Pools from "./components/pools.vue";
import Tokens from "./components/tokens.vue";

@Component({
  components: {
    BackNavBtn,
    Pools,
    Tokens
  }
})
export default class PoolsAndTokensList extends Vue {}
</script>

<style scoped lang="scss"></style>
