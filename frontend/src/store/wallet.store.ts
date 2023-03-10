import {Action, getModule, Module, Mutation, VuexModule} from "vuex-module-decorators";
import Vue from "vue";
import {Subject} from "rxjs-compat";
import store from "./index";
import {NetworkEnum, networkObjectMap, WalletEnum} from "../interfaces";
import StringService from "../services/string.service";
import WalletProviderPersistentStorageService from '@/services/persistent-storage/wallet-provider.service';

@Module({
  name: "wallet-store",
  dynamic: true,
  namespaced: true,
  store
})
export class WalletModule extends VuexModule {
  private address: string = "";
  private provider: WalletEnum = WalletEnum.none;
  private network: NetworkEnum = NetworkEnum.Main;

  public walletChanged$ = new Subject();

  @Mutation
  private writeWalletAddress(address: string) {
    this.address = address;
  }

  @Mutation
  private writeWalletProvider(provider: WalletEnum) {
    this.provider = provider;
  }

  @Mutation
  private writeWalletNetwork(network: NetworkEnum) {
    this.network = network;
  }

  @Action({rawError: true})
  public initWallet(payload: {address: string; provider: WalletEnum; network: NetworkEnum; rememberMe: boolean}) {
    this.writeWalletProvider(payload.provider);
    this.writeWalletAddress(payload.address);
    this.writeWalletNetwork(payload.network);
    if (payload.rememberMe) {
      WalletProviderPersistentStorageService.serialize(payload.provider);
    }
  }

  @Action({rawError: true})
  public destroyWallet() {
    this.writeWalletProvider(WalletEnum.none);
    this.writeWalletAddress("");
    this.writeWalletNetwork(NetworkEnum.Main);
    WalletProviderPersistentStorageService.clear();
    this.walletChanged$.next();
  }

  @Action({rawError: true})
  public async changeNetwork(network: NetworkEnum) {
    this.writeWalletNetwork(network);
    Vue.$toast.info(`Wallet network changed to ${networkObjectMap[network] ? networkObjectMap[network].name : network}`);
    this.walletChanged$.next();
  }

  @Action({rawError: true})
  public async changeWallet(address: string) {
    this.writeWalletAddress(address);
    Vue.$toast.info(`Wallet changed to ${address}`);
    this.walletChanged$.next();
  }

  get currentAddress() {
    return this.address;
  }

  get currentProvider(): WalletEnum {
    return this.provider;
  }

  get currentNetwork() {
    return this.network;
  }

  get isAuthenticated() {
    return this.currentProvider !== WalletEnum.none || !StringService.isNullOrWhitespace(this.address);
  }
}

const WalletStore = getModule(WalletModule);
export default WalletStore;
