import {RouteConfig} from "vue-router";
import CeloLayout from "./CeloLayout.vue";
import CeloTable from "./CeloTable.vue";
import {ApiService} from "@/services/api.service";
import AuthTokenPersistentStorageService from "@/services/persistent-storage/auth-token.service";
import WalletAuthService from "@/services/wallet-auth.service";
import WalletProviderPersistentStorageService from "@/services/persistent-storage/wallet-provider.service";
import {AdminRole} from "@/interfaces";
import WalletStore from "@/store/wallet.store";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs-compat";

export const celoRouting: RouteConfig = {
  path: "/celo",
  component: CeloLayout,
  beforeEnter: async (to, from, next) => {
    const walletProvider = WalletProviderPersistentStorageService.deserialize();
    if (!walletProvider) {
      return next("/rebalancer");
    }
    const currentWalletAddress = (await WalletAuthService[walletProvider].connect()).toLowerCase();

    const destroy$ = new Subject();
    WalletStore.walletChanged$
      .asObservable()
      .pipe(takeUntil(destroy$))
      .subscribe(async () => {
        return next("/rebalancer");
      });

    const adminRole = await ApiService.get<{role: string | null}>(`auth/check-admin-role/${currentWalletAddress}`).toPromise();
    if (adminRole.role == "admin" || adminRole.role == "celo") {
      return next();
    } else {
      return next("/rebalancer");
    }
  },
  children: [
    {
      path: "",
      name: "celo-table",
      component: CeloTable
    }
  ]
};
