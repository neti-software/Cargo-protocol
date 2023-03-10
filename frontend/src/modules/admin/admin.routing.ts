import {RouteConfig} from "vue-router";
import AdminLayout from "./AdminLayout.vue";
import NetworksList from "./networks/NetworksList.vue";
import AddNetwork from "./networks/AddNetwork.vue";
import PoolsAndTokensList from "./networks/PoolsAndTokensList.vue";
import AddPool from "./networks/AddPool.vue";
import StrategiesList from "./networks/StrategiesList.vue";
import AddStrategy from "./networks/AddStrategy.vue";
import AddToken from "./networks/AddToken.vue";
import AdminsList from "./admins/AdminsList.vue";
import AddAdmin from "./admins/AddAdmin.vue";
import Tools from "./tools/Tools.vue";
import {ApiService} from "@/services/api.service";
import AuthTokenPersistentStorageService from "@/services/persistent-storage/auth-token.service";
import WalletAuthService from "@/services/wallet-auth.service";
import WalletProviderPersistentStorageService from "@/services/persistent-storage/wallet-provider.service";
import {AdminRole} from "@/interfaces";
import WalletStore from "@/store/wallet.store";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs-compat";
import Statistics from "./statistics/Statistics.vue";

export const adminRouting: RouteConfig = {
  path: "/admin",
  component: AdminLayout,
  beforeEnter: async (to, from, next) => {
    const walletProvider = WalletProviderPersistentStorageService.deserialize();
    if (!walletProvider) {
      return next("/rebalancer");
    }
    const currentWalletAddress = await WalletAuthService[walletProvider].connect();

    const destroy$ = new Subject();
    WalletStore.walletChanged$
      .asObservable()
      .pipe(takeUntil(destroy$))
      .subscribe(async () => {
        return next("/rebalancer");
      });

    const adminRole = await ApiService.get<{role: string | null}>(`auth/check-admin-role/${currentWalletAddress}`).toPromise();
    if (adminRole.role !== AdminRole.ADMIN) {
      AuthTokenPersistentStorageService.clear();
      return next("/rebalancer");
    }

    const storageData = AuthTokenPersistentStorageService.deserialize();
    if (storageData) {
      const storageToken = JSON.parse(storageData);
      const token = JSON.parse(Buffer.from(storageToken.accessToken.split(".")[1] || "e30=", "base64").toString());

      if (token && token.address === currentWalletAddress && token.role === AdminRole.ADMIN) {
        ApiService.setAxiosAuthToken(storageToken.accessToken);
        return next();
      } else if (token && token.address !== currentWalletAddress && token.role !== AdminRole.ADMIN) {
        AuthTokenPersistentStorageService.clear();
      }
    }

    const nonceResponse = await ApiService.post<{nonce: string}>(`auth/nonce`, {address: currentWalletAddress}).toPromise();
    const signParams = [JSON.stringify(nonceResponse), currentWalletAddress];
    const signature = await WalletAuthService[walletProvider].provider.request?.({
      method: "personal_sign",
      params: signParams
    });

    const tokenResponse = await ApiService.post<{token: string}>(`auth/login`, {
      address: currentWalletAddress,
      signature,
      msg: nonceResponse
    }).toPromise();

    ApiService.setAxiosAuthToken(tokenResponse.token);
    AuthTokenPersistentStorageService.serialize(
      JSON.stringify({
        accessToken: tokenResponse.token,
        created: new Date()
      })
    );

    next();
  },
  children: [
    {path: "", redirect: "networks"},
    {
      path: "networks",
      component: AdminLayout,
      children: [
        {
          path: "",
          name: "admin-networks",
          component: NetworksList
        },
        {
          path: "add/:id?",
          name: "admin-networks-edit",
          component: AddNetwork
        },
        {
          path: ":id/pools-and-tokens",
          name: "admin-pools-and-tokens",
          component: PoolsAndTokensList
        },
        {
          path: ":id/pools/:pid?",
          name: "admin-pools-edit",
          component: AddPool
        },
        {
          path: ":id/tokens/:tid?",
          name: "admin-tokens-edit",
          component: AddToken
        },
        {
          path: ":id/pools/:pid/strategies",
          name: "admin-strategies",
          component: StrategiesList
        },
        {
          path: ":id/pools/:pid/strategies/:sid?",
          name: "admin-strategies-edit",
          component: AddStrategy
        }
      ]
    },
    {
      path: "admins",
      component: AdminLayout,
      children: [
        {
          path: "",
          name: "admin-admins",
          component: AdminsList
        },
        {
          path: "add",
          name: "new-admin-add",
          component: AddAdmin
        }
      ]
    },
    {
      path: "tools",
      component: AdminLayout,
      children: [
        {
          path: "",
          name: "admin-tools",
          component: Tools
        }
      ]
    },
    {
      path: "statistics",
      component: AdminLayout,
      children: [
        {
          path: "",
          name: "admin-statistics",
          component: Statistics
        }
      ]
    }
  ]
};
