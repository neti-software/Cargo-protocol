<template>
  <div class="not-found">
    <p class="font--heading mb-2">¯\_(ツ)_/¯</p>
    <v-btn @click="goHome" color="primary">
      Back to home
    </v-btn>
  </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";

@Component
export default class NotFound extends Vue {
  goHome() {
    this.$router.push('/');
  }
}
</script>

<style scoped lang="scss">
.not-found {
 position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  text-align: center;
}
</style>
