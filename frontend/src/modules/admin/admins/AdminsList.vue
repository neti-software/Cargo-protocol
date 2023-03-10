<template>
  <div>
    <div class="d-flex align-center">
      <v-btn :to="{name: 'new-admin-add'}" class="mr-5 mb-4" color="primary">
        <v-icon left>mdi-plus</v-icon>
        Add admin
      </v-btn>
    </div>

    <v-card class="admins-list">
      <v-card-title>Admins</v-card-title>
      <role-table role="admin" />
    </v-card>

    <v-card class="admins-list mt-5">
      <v-card-title>Celo members</v-card-title>
      <role-table role="celo" />
    </v-card>
  </div>
</template>

<script lang="ts">
import {Vue, Component} from "vue-property-decorator";
import RoleTable from "./components/role-table.vue";

@Component({components: {RoleTable}})
export default class AdminsList extends Vue {}
</script>

<style scoped lang="scss">
.admins-list {
  width: 800px;
}
</style>
