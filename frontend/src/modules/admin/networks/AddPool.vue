<template>
  <div>
    <back-nav-btn backLocationName="admin-pools-and-tokens" />
    <v-card class="new-network">
      <v-card-title v-if="!editMode">New Pool</v-card-title>
      <v-card-title v-if="editMode">Edit Pool</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field v-model="pool.uniswapPoolAddress" :rules="addressRules" label="Uniswap Pool Address" required></v-text-field>

          <v-select :items="tokens" label="Token0 Name" v-model="pool.token0Name" required />
          <v-text-field v-model="pool.token0Address" :rules="addressRules" readonly label="Token0 Address" required></v-text-field>
          <v-select :items="tokens" label="Token1 Name" v-model="pool.token1Name" required />
          <v-text-field v-model="pool.token1Address" :rules="addressRules" readonly label="Token1 Address" required></v-text-field>
          <v-text-field v-model="pool.fee" :rules="numberRules" label="Fee" required></v-text-field>

          <div v-if="fetchedPool" class="mb-5">
            Data from graphQL:<br />
            feeTier: {{ fetchedPool.feeTier }}<br />
            token0: {{ fetchedPool.token0Symbol }}<br />
            token1: {{ fetchedPool.token1Symbol }}<br />
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
import {Component, Vue, Watch, Ref} from "vue-property-decorator";
import AggregatorStore from "@/store/aggregator.store";
import AssetsStore from "@/store/assets.store";
import BackNavBtn from "@/modules/_shared/back-nav-btn/back-nav-btn.vue";
import {Pool} from "@/interfaces";
import UniswapV3Service from "@/services/uniswapV3.service";
import {ADDRESS_REGEX} from "@/modules/_shared/Validation";
import {GraphqlService} from "@/services/graphql.service";

@Component({components: {BackNavBtn}})
export default class AddPool extends Vue {
  @Ref() form!: any;

  public valid = true;
  public graphqlService: GraphqlService | undefined;
  public editMode = this.$route.params.pid ? true : false;
  public fetchedPool: {
    feeTier: string;
    token0Symbol: string;
    token1Symbol: string;
  } | null = null;
  public pool: Pool = {
    networkId: this.$route.params.id,
    token0Name: "",
    token0Address: "",
    token1Name: "",
    token1Address: "",
    fee: null,
    uniswapPoolAddress: ""
  };

  get tokens() {
    const tokensName: string[] = [];
    AssetsStore.assets.forEach((token) => {
      return token.networkId === this.$route.params.id && tokensName.push(token.name);
    });
    return tokensName;
  }

  async mounted() {
    const network = await AggregatorStore.getNetworkById(this.$route.params.id)
    this.graphqlService = new GraphqlService(network.graphqlUrl);
  }

  constructor() {
    super();
    if (this.editMode) {
      AggregatorStore.getPoolById(this.$route.params.pid).then((data) => {
        Object.assign(this.pool, data);
      });
    }
  }

  public defaultRules = [(v: string) => !!v || "Required"];
  public addressRules = [...this.defaultRules, (v: string) => (v && ADDRESS_REGEX.test(v)) || "Address is wrong format"];
  public numberRules = [...this.defaultRules, (v: number) => v > 0 || "The value must be greater than 0"];

  async validate() {
    this.form.validate();
    const preparedPool: Pool = {
      ...this.pool,
      token0Address: this.pool.token0Address.toLowerCase(),
      token1Address: this.pool.token1Address.toLowerCase(),
      uniswapPoolAddress: this.pool.uniswapPoolAddress.toLowerCase()
    };
    if (this.editMode) await AggregatorStore.editPool(preparedPool);
    else await AggregatorStore.addPool(preparedPool);

    await UniswapV3Service.fetchAdminData();
    await this.$router.push({name: "admin-pools-and-tokens"});
  }

  async reset() {
    this.form.reset();
    await this.$router.push({name: "admin-pools-and-tokens"});
  }

  @Watch("pool.uniswapPoolAddress")
  uniswapPoolAddressChange(value: string) {
    this.fetchedPool = null;
    if (ADDRESS_REGEX.test(value) && this.graphqlService) {
      this.graphqlService
        .post<{pools: {feeTier: string; token0: {symbol: string}; token1: {symbol: string}}[]}>({
          query: `query MyQuery($id: ID = "") {
                    pools(where: {id: $id}) {
                      feeTier
                      token1 {
                        symbol
                      }
                      token0 {
                        symbol
                      }
                    }
                  }`,
          variables: {
            id: value.toLowerCase()
          }
        })
        .then((result) => {
          if (result?.pools.length === 1) {
            this.pool.fee = +result.pools[0].feeTier / 10000;
            this.pool.token0Name = result.pools[0].token0.symbol;
            this.pool.token1Name = result.pools[0].token1.symbol;

            this.fetchedPool = {
              feeTier: result.pools[0].feeTier,
              token0Symbol: result.pools[0].token0.symbol,
              token1Symbol: result.pools[0].token1.symbol
            };
          }
        });
    }
  }

  @Watch("pool.token0Name")
  token0NameChanged(value: string) {
    this.pool.token0Address = AssetsStore.assets.find((token) => token.name == value)!.address;
  }

  @Watch("pool.token1Name")
  token1NameChanged(value: string) {
    this.pool.token1Address = AssetsStore.assets.find((token) => token.name == value)!.address;
  }
}
</script>

<style scoped lang="scss">
.new-network {
  width: 700px;
}
</style>
