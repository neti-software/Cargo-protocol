<template>
  <div>
    <back-nav-btn backLocationName="admin-admins" />
    <v-card class="new-admin">
      <v-card-title>New Admin</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field v-model="admin.name" :rules="defaultRules" label="Name" required></v-text-field>
          <v-text-field v-model="admin.address" :rules="addressRules" label="Address" required></v-text-field>
          <v-select :items="roles" label="Role" v-model="admin.role" required />

          <div class="d-flex flex-row justify-space-between mt-3">
            <v-btn color="error" @click="reset">Cancel</v-btn>
            <v-spacer />
            <v-btn :disabled="!valid" color="success" @click="validate">Save</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Ref} from "vue-property-decorator";
import {Admin} from "@/interfaces";
import BackNavBtn from "@/modules/_shared/back-nav-btn/back-nav-btn.vue";
import {ADDRESS_REGEX} from "@/modules/_shared/Validation";
import AdminsStore from "@/store/admins.store";

@Component({components: {BackNavBtn}})
export default class AddAdmin extends Vue {
  @Ref() form!: any;
  public valid = true;
  public admin: Admin = {
    name: "",
    address: "",
    role: ""
  };

  public roles = ["ADMIN", "CELO"];

  public defaultRules = [(v: string) => !!v || "Required"];
  public addressRules = [...this.defaultRules, (v: string) => (v && ADDRESS_REGEX.test(v)) || "Address is wrong format"];

  async validate() {
    this.form.validate();
    const preparedAdmin: Admin = {
      ...this.admin,
      address: this.admin.address.toLowerCase(),
      role: this.admin.role.toLowerCase()
    };

    await Promise.all([await AdminsStore.addAdmin(preparedAdmin), await AdminsStore.cleanAdmins()]);
    await AdminsStore.getAdmins().then(async (data) => await AdminsStore.saveAdmins(data));
    await this.$router.push({name: "admin-admins"});
  }

  async reset() {
    this.form.reset();
    await AdminsStore.getAdmins();
    await this.$router.push({name: "admin-admins"});
  }
}
</script>

<style scoped lang="scss">
.new-admin {
  width: 750px;
}
</style>
