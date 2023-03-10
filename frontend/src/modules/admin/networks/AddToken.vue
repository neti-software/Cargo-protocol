<template>
  <div>
    <back-nav-btn backLocationName="admin-pools-and-tokens" />
    <v-card class="new-token">
      <v-card-title v-if="!editMode">New Token</v-card-title>
      <v-card-title v-if="editMode">Edit Token</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field v-model="token.name" :rules="defaultRules" label="Name" required></v-text-field>
          <v-text-field v-model="token.address" :rules="addressRules" label="Address" required></v-text-field>

          <v-text-field v-model="token.color" readonly label="Color" required></v-text-field>
          <v-color-picker dot-size="25" mode="hexa" class="mt-2 mb-8" v-model="token.color"></v-color-picker>

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
import AssetsStore from "@/store/assets.store";
import BackNavBtn from "@/modules/_shared/back-nav-btn/back-nav-btn.vue";
import {Token} from "@/interfaces";
import UniswapV3Service from "@/services/uniswapV3.service";
import {ADDRESS_REGEX} from "@/modules/_shared/Validation";

@Component({components: {BackNavBtn}})
export default class AddToken extends Vue {
  @Ref() form!: any;

  public valid: boolean = true;
  public editMode = this.$route.params.tid ? true : false;
  public showColor: boolean = false;
  public token: Token = {
    networkId: this.$route.params.id,
    name: "",
    address: "",
    color: ""
  };

  constructor() {
    super();

    if (this.editMode) {
      AssetsStore.getAssetById(this.$route.params.tid).then((data) => {
        Object.assign(this.token, data);
      });
    }
  }

  public defaultRules = [(v: string) => !!v || "Required"];
  public addressRules = [...this.defaultRules, (v: string) => (v && ADDRESS_REGEX.test(v)) || "Address is wrong format"];

  async validate() {
    this.form.validate() && this.token.color !== "";
    const preparedToken: Token = {
      ...this.token,
      address: this.token.address.toLowerCase()
    };

    if (this.editMode) await AssetsStore.editAsset(preparedToken);
    else await AssetsStore.addAsset(preparedToken);

    await UniswapV3Service.fetchAdminData();
    await this.$router.push({name: "admin-pools-and-tokens"});
  }

  async reset() {
    this.form.reset();
    await this.$router.push({name: "admin-pools-and-tokens"});
  }
}
</script>

<style scoped lang="scss">
.new-token {
  width: 700px;
}
</style>
