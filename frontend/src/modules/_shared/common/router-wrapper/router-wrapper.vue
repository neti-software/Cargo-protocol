<template>
  <router-view v-if="isAuthenticated"/>
  <not-authorised v-else/>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import NotAuthorised from "@/modules/_common/not-authorised.vue";
@Component({
  components: {NotAuthorised}
})
export default class RouterWrapper extends Vue{
  public isAuthenticated = true;
}
</script>

