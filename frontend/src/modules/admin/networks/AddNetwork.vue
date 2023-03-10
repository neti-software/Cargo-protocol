<template>
  <div>
    <back-nav-btn backLocationName="admin-networks" />
    <v-card class="new-network">
      <v-card-title v-if="!editMode">New Network</v-card-title>
      <v-card-title v-if="editMode">Edit Network</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field v-model="network.name" :rules="defaultRules" label="Name" required></v-text-field>
          <v-text-field v-model="network.platform" :rules="defaultRules" label="Platform" required></v-text-field>

          <div class="d-flex align-center justify-space-between new-network--url">
            <v-select
              v-model="network.transportProtocol"
              :rules="defaultRules"
              :items="possibleTransportProtocols"
              label="Transport Protocol"
              required
              @change="form.validate()"
            ></v-select>
            <v-text-field v-model="network.networkUrl" :rules="chainNetworkUrlRules" label="Chain Network Url" required></v-text-field>
          </div>

          <v-text-field v-model="network.rpcUrl" :rules="rpcUrlRules" label="Rpc Url" required></v-text-field>
          <v-text-field v-model="network.chainId" :rules="numberRules" label="Chain ID" required></v-text-field>
          <v-text-field v-model="network.cargoServiceAddress" :rules="addressRules" label="CargoService Address" required></v-text-field>
          <v-text-field v-model="network.graphqlUrl" label="GraphQL url" required></v-text-field>

          <div class="d-flex align-center justify-space-between scheduler">
            <v-text-field type="number" v-model="scheduler.amount" :rules="numberRules" label="Execute reinvest every" required></v-text-field>
            <v-select v-model="scheduler.unit" :rules="defaultRules" :items="unit" required></v-select>
          </div>

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
import AggregatorStore from "@/store/aggregator.store";
import {Network} from "@/interfaces";
import BackNavBtn from "@/modules/_shared/back-nav-btn/back-nav-btn.vue";
import {ADDRESS_REGEX} from "@/modules/_shared/Validation";

@Component({components: {BackNavBtn}})
export default class AddNetwork extends Vue {
  @Ref() form!: any;

  public valid = true;
  public editMode = this.$route.params.id ? true : false;
  public possibleTransportProtocols = ["https", "wss"];
  public network: Network = {
    name: "",
    platform: "",
    networkUrl: "",
    rpcUrl: "",
    chainId: null,
    transportProtocol: "",
    cargoServiceAddress: "",
    graphqlUrl: "",
    isActive: false
  };

  public unit = ["minutes", "hours", "days"];
  public scheduler: {amount: number | null; unit: string} = {
    amount: null,
    unit: ""
  };

  constructor() {
    super();

    if (this.editMode) {
      AggregatorStore.getNetworkById(this.$route.params.id).then((data) => {
        Object.assign(this.network, data);

        const executionPeriod = data!.executionPeriod!.split(" ");
        this.scheduler.amount = +executionPeriod[0];
        this.scheduler.unit = executionPeriod[1];
      });
    }
  }

  public defaultRules = [(v: string) => !!v || "Required"];
  public addressRules = [...this.defaultRules, (v: string) => (v && ADDRESS_REGEX.test(v)) || "Address is wrong format"];
  public numberRules = [
    ...this.defaultRules,
    (v: number) => Number.isInteger(Number(v)) || "The value must be a number",
    (v: number) => v > 0 || "The value must be greater than 0"
  ];
  public chainNetworkUrlRules = [
    ...this.defaultRules,
    (v: string) => (v && this.chainNetworkUrlRulesRegEx.test(v)) || "URL is wrong format"
  ];
  public rpcUrlRules = [
    ...this.defaultRules,
    (v: string) => (v && new RegExp("https://", "g").test(v)) || "Rpc URL is wrong format"
  ];

  get chainNetworkUrlRulesRegEx() {
    const pattern = `${this.network.transportProtocol}://`;
    return new RegExp(pattern, "g");
  }

  async validate() {
    this.form.validate();
    const preparedNetwork: Network = {
      ...this.network,
      cargoServiceAddress: this.network.cargoServiceAddress.toLowerCase(),
      executionPeriod: `${this.scheduler.amount} ${this.scheduler.unit}`
    };
    if (this.editMode) await AggregatorStore.editNetwork(preparedNetwork);
    else await AggregatorStore.addNetwork(preparedNetwork);
    Promise.all([await AggregatorStore.cleanNetworks(), await AggregatorStore.fetchNetworks()]);
    await this.$router.push({name: "admin-networks"});
  }

  async reset() {
    this.form.reset();
    await AggregatorStore.fetchNetworks();
    await this.$router.push({name: "admin-networks"});
  }
}
</script>

<style scoped lang="scss">
.new-network {
  width: 700px;

  &--url .v-select,
  & .scheduler .v-input:first-of-type {
    max-width: 230px;
  }

  &--url .v-select {
    margin-right: 50px;
  }

  & .scheduler .v-select {
    margin-left: 50px;
  }
}
</style>
