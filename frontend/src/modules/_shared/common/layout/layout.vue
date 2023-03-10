<template>
  <div>
    <global-notifications />
    <global-loader v-if="isLoading" />
    <phone-navigation ref="main-menu" />
    <modal-root />
    <div :class="`main-view ${walletConnected && !newUser && 'navigation--desktop'}`">
      <header class="main-view__header">
        <v-btn v-if="walletConnected && !newUser" class="main-view__nav--phone" icon large color="primary" @click="mainMenu.open()">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
        <v-toolbar-title class="d-flex flex-column flex-md-row align-center">
          <cargo-logo
            class="main-view__header--logo"
            size="55"
            @click="goHome"
            :showHeader="$vuetify.breakpoint.smAndUp ? true : false"
            :use-big="$vuetify.breakpoint.smAndUp"
          />
        </v-toolbar-title>
        <div class="main-view__nav" v-if="walletConnected && !checkingNavigation">
          <Nav />
        </div>
        <v-spacer></v-spacer>
        <div v-if="walletConnected" class="main-view__wallet">
          <div class="main-view__wallet--address" v-if="$vuetify.breakpoint.smAndUp">
            <div class="d-flex justify-end align-center" @click="editWallet">
              <div class="main-view__wallet--address-hider">
                <wallet-logo :wallet-type="provider" size="30" />
                {{ address.substr(0, address.length - 4) }}
              </div>
              <div class="main-view__wallet--address-ellipsis">...</div>
              <div>{{ address.substr(-4, 4) }}</div>
            </div>
          </div>
          <div class="main-view__wallet--button" v-if="$vuetify.breakpoint.xsOnly">
            <v-btn text color="primary" class="d-flex justify-end" @click="editWallet">
              <wallet-logo class="mr-1" :wallet-type="provider" size="24" />
              My wallet
            </v-btn>
          </div>
        </div>
        <v-btn class="main-view__wallet--connect" large v-if="!walletConnected" color="primary" elevation="0" @click="connectWallet">
          Connect Wallet
        </v-btn>
      </header>
      <div v-if="!loadingContent" :class="`main-view__content ${adminMode && 'navigation-admin'}`">
        <div v-if="wrongNetwork && !adminMode" class="main-view__network">
          <h2>Please connect to valid network</h2>
          <p class="main-view__network--info">
            Cargo contracts have not been deployed to the current network you are connected to. Please connect to a network
            <span v-if="typeof networkName == 'number'">with chain ID</span>
            <b> {{ networkName }}</b> in your wallet.
          </p>
          <v-btn color="secondary" @click="changeNetwork" :loading="changingNetwork">Change Network</v-btn>
        </div>
        <div class="main-view__admin-nav" v-if="adminMode">
          <router-link to="/admin/networks" class="main-view__admin-nav__item">Networks</router-link>
          <router-link to="/admin/admins" class="main-view__admin-nav__item">Admins</router-link>
          <router-link to="/admin/tools" class="main-view__admin-nav__item">Tools</router-link>
          <router-link to="/admin/statistics" class="main-view__admin-nav__item">Statistics</router-link>
        </div>
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Ref, Vue, Watch} from "vue-property-decorator";
import WalletConnectProvider from "@walletconnect/web3-provider";
import {ethers} from "ethers";
import {Ethereum, WalletEnum, networkObjectMap, NetworkEnum} from "@/interfaces";
import WalletAuthService from "@/services/wallet-auth.service";
import CargoLogo from "@/modules/_shared/common/cargo-logo/cargo-logo.vue";
import GlobalNotifications from "@/modules/_shared/common/global-notifications/global-notifications.vue";
import GlobalLoader from "@/modules/_shared/common/global-loader/global-loader.vue";
import WalletStore from "@/store/wallet.store";
import CommonStore from "@/store/common.store";
import WalletModal from "@/modules/_shared/modals/wallet-modal/wallet-modal.vue";
import WalletLogo from "@/modules/_shared/common/wallet-logo/wallet-logo.vue";
import ModalService from "@/services/modal.service";
import ModalRoot from "@/modules/_shared/modals/modal-root.vue";
import ConnectModal from "@/modules/_shared/modals/connect-modal/connect-modal.vue";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs-compat";
import UniswapV3Service from "@/services/uniswapV3.service";
import AggregatorStore from "@/store/aggregator.store";
import Nav from "@/modules/_shared/common/navigation-menu/nav/nav.vue";
import PhoneNavigation from "@/modules/_shared/common/navigation-menu/phone-nav/phone-nav.vue";
import WalletProviderPersistentStorageService from "@/services/persistent-storage/wallet-provider.service";
import AuthTokenPersistentStorageService from "@/services/persistent-storage/auth-token.service";
import {ApiService} from "@/services/api.service";
import {Route} from "vue-router";
import AdminsStore from "@/store/admins.store";
import MetaMaskOnboarding from "@metamask/onboarding";
import Moment from "moment";

@Component({
  components: {CargoLogo, GlobalNotifications, ModalRoot, GlobalLoader, WalletLogo, Nav, PhoneNavigation}
})
export default class Layout extends Vue {
  @Ref("modal-root") modalRoot!: ModalRoot;
  @Ref("main-menu") readonly mainMenu!: PhoneNavigation;

  private readonly TOKEN_TIMEOUT_HOURS = 8;
  private readonly destroy$ = new Subject();

  public loadingContent: boolean = true;
  public changingNetwork: boolean = false;
  public checkingNavigation: boolean = true;

  get newUser() {
    return CommonStore.newUser;
  }

  get walletConnected() {
    return WalletStore.isAuthenticated;
  }

  get address() {
    return WalletStore.currentAddress;
  }

  get provider() {
    return WalletStore.currentProvider;
  }

  get currentWalletNetwork() {
    return WalletStore.currentNetwork;
  }

  get isLoading() {
    return CommonStore.isLoading;
  }

  get wrongNetwork() {
    return CommonStore.wrongWalletNetwork;
  }

  get adminMode() {
    return CommonStore.adminMode;
  }

  get chainId() {
    return AggregatorStore.currentNetwork.chainId! as NetworkEnum;
  }

  get networkName() {
    if (AggregatorStore.currentNetwork) return networkObjectMap[this.chainId] ? networkObjectMap[this.chainId].name : +this.chainId;
    else return "";
  }

  get isMetaMaskInstalled(): boolean {
    return MetaMaskOnboarding.isMetaMaskInstalled();
  }

  async created() {
    CommonStore.startLoading();

    if (!this.isMetaMaskInstalled) {
      WalletProviderPersistentStorageService.clear();
    }

    const al = this.detectAutoLogin();
    if (al !== WalletEnum.none) {
      await this.autoLogin();
      this.setWalletListeners();
    }

    await AggregatorStore.fetchActiveNetwork();
    await this.checkAdminRoleAndToken();

    setTimeout(async () => {
      if (!this.$route.name!.includes("admin")) await this.getUniswapData();

      this.loadingContent = false;
      this.checkingNavigation = false;
      CommonStore.stopLoading();
    }, 100);

    CommonStore.adminModeChanged$
      .asObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(async () => {
        CommonStore.startLoading();
        this.loadingContent = true;
        if (!this.adminMode) await this.getUniswapData();
        this.loadingContent = false;
        CommonStore.stopLoading();
      });

    WalletStore.walletChanged$
      .asObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(async () => {
        CommonStore.startLoading();
        this.loadingContent = true;

        AuthTokenPersistentStorageService.clear();
        ApiService.setAxiosAuthToken("");
        await this.checkAdminRoleAndToken();
        if (!this.adminMode) await this.getUniswapData();

        this.loadingContent = false;
        CommonStore.stopLoading();
      });
  }

  async getUniswapData() {
    if (AggregatorStore.currentNetwork && this.walletConnected) {
      if (this.provider !== 1) {
        CommonStore.saveWrongWalletNetwork(false);
        await UniswapV3Service.initData();
        return;
      }

      if (this.currentWalletNetwork == AggregatorStore.currentNetwork.chainId) {
        await UniswapV3Service.initData();
        CommonStore.saveWrongWalletNetwork(false);
      } else {
        CommonStore.saveWrongWalletNetwork(true);
        CommonStore.saveNewUser(true);
      }
    } else {
      await UniswapV3Service.initData();
      CommonStore.saveWrongWalletNetwork(false);
    }
  }

  async checkAdminRoleAndToken() {
    if (this.walletConnected) {
      const adminRole = await ApiService.get<{role: string | null}>(`auth/check-admin-role/${this.address}`).toPromise();
      CommonStore.saveAdminRole(adminRole.role);

      const storageData = AuthTokenPersistentStorageService.deserialize();
      if (storageData) {
        try {
          const storageToken = JSON.parse(storageData);
          if (Moment().isAfter(Moment(storageToken.created).add(this.TOKEN_TIMEOUT_HOURS, "hours"))) {
            AuthTokenPersistentStorageService.clear();
          }
        } catch (err) {
          AuthTokenPersistentStorageService.clear();
        }
      }
    }
  }

  async changeNetwork() {
    this.changingNetwork = true;
    const params = {
      chainId: `0x${Number(AggregatorStore.currentNetwork.chainId).toString(16)}`,
      chainName: AggregatorStore.currentNetwork.name,
      rpcUrls: [AggregatorStore.currentNetwork.rpcUrl]
    };
    try {
      await (window as any).ethereum?.request({
        method: "wallet_addEthereumChain",
        params: [params]
      });
    } catch (err) {
      this.$toast.error(err);
    } finally {
      this.changingNetwork = false;
    }
  }

  async goHome() {
    if (this.$vuetify.breakpoint.mdAndUp && this.$route.name !== "rebalancer-main") await this.$router.replace({path: "/"});
  }

  connectWallet() {
    ModalService.open(ConnectModal);
  }

  editWallet() {
    ModalService.open(WalletModal);
  }

  private setWalletListeners() {
    if (WalletStore.currentProvider === WalletEnum.none) {
      return;
    }

    //TODO: Change any to Web3Provider when ethers.js@6 will be released. It'll come with full typescript support
    const setupProviderEvents = (provider: Ethereum | any) => {
      provider.removeListener("chainChanged", this.chainListener);
      provider.removeListener("accountsChanged", this.accountListener);
      provider.on("chainChanged", this.chainListener);
      provider.on("accountsChanged", this.accountListener);
    };

    if (WalletStore.currentProvider === WalletEnum.coinbase || WalletStore.currentProvider === WalletEnum.metamask) {
      const provider = WalletAuthService[WalletStore.currentProvider].provider as Ethereum;
      setupProviderEvents(provider);
    } else {
      const provider = WalletAuthService[WalletStore.currentProvider].provider as WalletConnectProvider;
      const web3Provider = new ethers.providers.Web3Provider(provider);
      setupProviderEvents(web3Provider);
    }
  }

  private async chainListener(payload: string) {
    await WalletStore.changeNetwork(parseInt(payload, 16));
  }

  private async accountListener(payload: string[]) {
    await WalletStore.changeWallet(payload[0]);
  }

  private async autoLogin(): Promise<void> {
    const rememberMe = this.detectAutoLogin();
    if (rememberMe) {
      const address = await WalletAuthService[rememberMe].connect();
      const network = WalletAuthService[rememberMe].network;
      WalletStore.initWallet({address, provider: rememberMe, network, rememberMe: true});
    }
  }

  private detectAutoLogin(): WalletEnum | undefined {
    return WalletProviderPersistentStorageService.deserialize();
  }

  @Watch("walletConnected")
  handleIsAuthenticatedChange() {
    if (!this.isLoading && !this.walletConnected) {
      this.goHome();
    }
  }

  @Watch("$route.name")
  async routerChanged(route: Route) {
    if (route.toString() == "admin-networks") {
      CommonStore.startLoading();
      CommonStore.saveAdminMode(true);
      this.loadingContent = true;
      if (AdminsStore.admins.length === 0) await UniswapV3Service.fetchAdminData();
      this.loadingContent = false;
      CommonStore.stopLoading();
    }
  }
}
</script>

<style scoped lang="scss" src="./layout.scss" />
