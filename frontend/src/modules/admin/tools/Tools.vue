<template>
  <div class="tools">
    <v-card class="tools__tool" rounded outlined elevation="10">
      <v-card-title>
        Tokens proportion
      </v-card-title>
      <div class="tools__tool-wrapper">
        <v-form ref="form" v-model="valid" class="tools__tool-form">
          <v-text-field v-model="cargoServiceAddress" :rules="addressRules" label="Cargo service address" required></v-text-field>
          <v-text-field v-model="poolAddress" :rules="addressRules" label="Pool address" required></v-text-field>
          <v-text-field v-model="tickLower" type="number" label="TickLower" required></v-text-field>
          <v-text-field v-model="tickUpper" type="number" label="TickUpper" required></v-text-field>
        </v-form>
        <div class="tools__tool-results">
          <p v-if="errorMessage">Error: {{errorMessage}}</p>
          <div v-if="token0 && token1">
            <p>Token0: {{token0}}</p>
            <p>Token1: {{token1}}</p>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { ADDRESS_REGEX } from "@/modules/_shared/Validation";
import ContractService from "@/services/contract.service";
import { ContractInterface, providers } from "ethers";
import {Vue, Component, Watch, Ref} from "vue-property-decorator";
import cargoServiceTest from "@/abis/CargoServiceTest.json";
import WalletAuthService from "@/services/wallet-auth.service";
import WalletStore from "@/store/wallet.store";
import AdminToolsPersistentStorageService from '@/services/persistent-storage/admin-tools.service';
import AggregatorStore from "@/store/aggregator.store";

@Component({})
export default class Tools extends Vue {
  @Ref() form!: any;
  public valid = true;

  public cargoServiceAddress: string = '';
  public poolAddress: string = '';
  public tickLower: number = -10020;
  public tickUpper: number = 10020;

  public token0: number = 0;
  public token1: number = 0;

  public returnedValue1: number = 0;
  public returnedValue2: number = 0;
  public errorMessage: string = '';

  public defaultRules = [(v: string) => !!v || "Required"];
  public addressRules = [...this.defaultRules, (v: string) => (v && ADDRESS_REGEX.test(v)) || "Address is wrong format"];

  mounted() {
    const adminToolsPersistentData = AdminToolsPersistentStorageService.deserialize();
    if (adminToolsPersistentData) {
      const { tokensProportion: { cargoPoolAddress, cargoServiceAddress } } = adminToolsPersistentData;
      this.cargoServiceAddress = cargoServiceAddress;
      this.poolAddress = cargoPoolAddress;
    }
    this.callStaticContract();
  }

  async callStaticContract() {
    if (!this.form.validate()) {
      return;
    }

    this.errorMessage = '';
    this.token0 = 0;
    this.token1 = 0;

    const cargoServiceContract = ContractService.getContract(
      cargoServiceTest as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      this.cargoServiceAddress.toLowerCase()
    );

    const signer = new providers.Web3Provider(WalletAuthService[WalletStore.currentProvider].provider).getSigner();

    const connectedCargoServiceContract = cargoServiceContract.connect(signer);

    try {
      const output = await connectedCargoServiceContract.callStatic.StaticRebalanceTickRange(
        this.poolAddress.toLowerCase(),
        this.tickLower,
        this.tickUpper
      );

      AdminToolsPersistentStorageService.serialize({
        tokensProportion: {
          cargoPoolAddress: this.poolAddress.toLowerCase(),
          cargoServiceAddress: this.cargoServiceAddress.toLowerCase()
        }
      });
      const [token0Price, token1Price] = output;
      this.token0 = token0Price;
      this.token1 = token1Price;
    } catch (e: any) {
      this.errorMessage = e?.data?.message || JSON.stringify(e);
      throw(e);
    }
  }

  @Watch('tickUpper')
  tickUpperChanged() {
    this.callStaticContract();
  }

  @Watch('tickLower')
  tickLowerChanged() {
    this.callStaticContract();
  }

  @Watch('cargoServiceAddress')
  cargoServiceAddressChanged() {
    this.callStaticContract();    
  }

  @Watch('poolAddress')
  cargoPoolAddressChanged() {
    this.callStaticContract();    
  }
}
</script>

<style scoped lang="scss">
.tools {
  padding: 0 15px;
  display: flex;
  flex-direction: row;

  &__tool {
    width: 1400px;
  }

  &__tool-wrapper {
    display: grid;
    grid-template-columns: 50% 50%;
  }

  &__tool-form {
    padding: 10px 100px 0 10px;
    width: 100%;
  }

  &__tool-graphql {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
  }

  &__tool-results {

  } 
}
</style>
