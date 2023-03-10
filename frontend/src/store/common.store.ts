import {Action, getModule, Module, Mutation, VuexModule} from "vuex-module-decorators";
import store from "./index";
import {GlobalNotification, TransactionNotification} from "@/interfaces/notification.interface";
import {TransportProtocol} from "@/interfaces";
import AggregatorStore from "./aggregator.store";
import {providers, utils} from "ethers";
import Web3WsProvider from "web3-providers-ws";
import WalletStore from "./wallet.store";
import WalletAuthService from "@/services/wallet-auth.service";
import {Subject} from "rxjs-compat";
@Module({
  name: "_common-store",
  dynamic: true,
  namespaced: true,
  store
})
export class CommonModule extends VuexModule {
  private _loading: boolean = false;
  private _history?: boolean = undefined;
  private _notifications: GlobalNotification[] = [];
  private _transactionNotifications: TransactionNotification[] = [];
  private _transactionIsActive: boolean = false;
  private _provider: any = {};
  private _wrongWalletNetwork: boolean = true;
  private _adminMode: boolean = false;
  private _newUser: boolean = false;
  private _adminRole: string | null = null;

  public adminModeChanged$ = new Subject();

  @Mutation
  private writeHistory(history: boolean) {
    if (!this._history) {
      this._history = history;
    }
  }

  @Mutation
  private writeWrongWalletNetwork(value: boolean) {
    this._wrongWalletNetwork = value;
  }

  @Mutation
  private writeAdminMode(value: boolean) {
    this._adminMode = value;
  }

  @Mutation
  private writeAdminRole(value: string | null) {
    this._adminRole = value;
  }

  @Mutation
  private writeNewUser(value: boolean) {
    this._newUser = value;
  }

  @Mutation
  private writeLoading(loading: boolean) {
    this._loading = loading;
  }

  @Mutation
  private writeNotifications(notifications: GlobalNotification[]) {
    this._notifications.length = 0;
    notifications.forEach((item) => {
      this._notifications.push(item);
    });
  }

  @Mutation
  private writeProvider(value: string) {
    const transportProtocol = AggregatorStore.currentNetwork.transportProtocol;
    if (transportProtocol === TransportProtocol.HTTPS) {
      this._provider = new providers.JsonRpcProvider(value);
    } else {
      this._provider = new providers.Web3Provider(
        new (Web3WsProvider as any)(value, {
          clientConfig: {
            keepalive: true,
            keepaliveInterval: 60000
          },
          reconnect: {
            auto: true,
            delay: 1000,
            maxAttempts: 10,
            onTimeout: false
          }
        }),
        "any"
      );
    }
  }

  @Mutation
  private writeTransactionIsActive(isActive: boolean) {
    this._transactionIsActive = isActive;
  }

  @Action({rawError: true})
  public async saveProvider(value: string) {
    this.writeProvider(value);
  }

  @Action({rawError: true})
  public async saveWrongWalletNetwork(value: boolean) {
    this.writeWrongWalletNetwork(value);
  }

  @Action({rawError: true})
  public async saveAdminRole(value: string | null) {
    this.writeAdminRole(value);
  }

  @Action({rawError: true})
  public async saveAdminMode(value: boolean) {
    this.writeAdminMode(value);
    this.adminModeChanged$.next();
  }

  @Action({rawError: true})
  public async saveNewUser(value: boolean) {
    this.writeNewUser(value);
  }

  @Action({rawError: true})
  public startLoading(timeout?: number) {
    this.writeLoading(true);
    if (timeout) {
      setTimeout(() => {
        this.writeLoading(false);
      }, timeout);
    }
  }

  @Action({rawError: true})
  public stopLoading() {
    this.writeLoading(false);
  }

  @Action({rawError: true})
  public setHistory(isHistory: boolean) {
    this.writeHistory(isHistory);
  }

  @Action({rawError: true})
  public removeNotification(id: string) {
    const idx = this._notifications.findIndex((item: GlobalNotification) => item.id === id);
    const newArray = [...this._notifications];
    newArray.splice(idx, 1);
    this.writeNotifications(newArray);
  }

  @Action({rawError: true})
  public setTransactionIsActive(isActive: boolean) {
    this.writeTransactionIsActive(isActive);
  }

  @Action({rawError: true})
  public async addTransactionNotification(notification: TransactionNotification) {
    switch (notification.type) {
      case "success":
        notification.color = "#47d78a";
        notification.icon = "mdi-check-circle";
        break;
      case "error":
        notification.color = "#f7471c";
        notification.icon = "mdi-close-circle";
        break;
      case "info":
        notification.color = "#1c85d5";
        notification.icon = "mdi-alert-circle";
        break;
      case "warning":
        notification.color = "#febc22";
        notification.icon = "mdi-alert";
        break;
    }

    if (notification.gasUsed) {
      const provider = new providers.Web3Provider(WalletAuthService[WalletStore.currentProvider].provider);
      const gasPrice = await provider.getGasPrice();
      const calculatedGas = +gasPrice * +notification.gasUsed;
      notification.gasUsed = utils.formatEther(calculatedGas);
    }

    notification.show = true;
    this._transactionNotifications.push(notification);
    this.setTransactionIsActive(true);
  }
  get isLoading() {
    return this._loading;
  }

  get history() {
    return this._history;
  }

  get notifications() {
    return this._notifications;
  }

  get transactionNotifications() {
    return this._transactionNotifications;
  }

  get provider() {
    return this._provider;
  }

  get transactionIsActive() {
    return this._transactionIsActive;
  }

  get wrongWalletNetwork() {
    return this._wrongWalletNetwork;
  }

  get adminMode() {
    return this._adminMode;
  }

  get newUser() {
    return this._newUser;
  }

  get adminRole() {
    return this._adminRole;
  }
}

const CommonStore = getModule(CommonModule);
export default CommonStore;
