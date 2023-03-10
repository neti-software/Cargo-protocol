import {Action, getModule, Module, Mutation, VuexModule} from "vuex-module-decorators";
import store from "./index";
import {Network} from "@/interfaces/network.interface";
import {Pool} from "@/interfaces";
import {ApiService} from "@/services/api.service";

@Module({
  name: "_aggregator-store",
  dynamic: true,
  namespaced: true,
  store
})
export class AggregatorModule extends VuexModule {
  private _networks: Network[] = [];
  private _pools: Pool[] = [];
  private _currentNetwork: any = {};

  get currentNetwork(): Network {
    return this._currentNetwork as Network;
  }

  get networks() {
    return this._networks;
  }

  get pools() {
    return this._pools;
  }

  @Mutation
  private writeNetworks(networks: Network[]) {
    this._networks.length = 0;
    networks.forEach((network) => this._networks.push(network));
  }

  @Mutation
  private writePools(pools: Pool[]) {
    this._pools.length = 0;
    pools.forEach((pool) => this._pools.push(pool));
  }

  @Mutation
  private setCurrentNetwork(value: Network) {
    this._currentNetwork = value;
  }

  @Mutation
  private removePools() {
    this._pools.length = 0;
  }

  @Mutation
  private removeNetworks() {
    this._networks.length = 0;
  }

  @Action({rawError: true})
  public async cleanPools() {
    this.removePools();
  }

  @Action({rawError: true})
  public async cleanNetworks() {
    this.removeNetworks();
  }

  @Action({rawError: true})
  public async fetchActiveNetwork() {
    const currentNetwork = await ApiService.get<Network>(`network/active`).toPromise();
    if (currentNetwork) {
      this.setCurrentNetwork(currentNetwork as Network);
    }
  }

  @Action({rawError: true})
  public async fetchNetworks() {
    const networks = (await ApiService.get<Network>("network").toPromise()) as unknown;
    this.writeNetworks(networks as Network[]);
    this.fetchActiveNetwork();
  }

  @Action({rawError: true})
  public async getNetworkById(id: string): Promise<Network> {
    return (await ApiService.get<Network>(`network/${id}`).toPromise()) as Network;
  }

  @Action({rawError: true})
  public async addNetwork(network: Network) {
    await ApiService.post<Network>("network", network).toPromise();
  }

  @Action({rawError: true})
  public async editNetwork(network: Network) {
    return ApiService.put<Network>(`network/${network.id}`, network).toPromise();
  }

  @Action({rawError: true})
  public async deleteNetwork(id: string) {
    await ApiService.delete<Network>(`network/${id}`).toPromise();
  }

  @Action({rawError: true})
  public async getNetworkPools(networkId?: string) {
    const pools = (await ApiService.get<Pool>(`${networkId ? `pool?networkId=${networkId}` : "pool"}`).toPromise()) as unknown;
    return pools as Pool[];
  }

  @Action({rawError: true})
  public async savePools(pools: Pool[]) {
    this.writePools(pools);
  }

  @Action({rawError: true})
  public async updatePool(newPool: Pool) {
    const poolRef = this._pools.find((p) => p.id === newPool.id);
    if (poolRef) {
      Object.assign(poolRef, newPool);
    }
  }

  @Action({rawError: true})
  public async getPoolById(id: string): Promise<Pool> {
    return (await ApiService.get<Pool>(`pool/${id}`).toPromise()) as Pool;
  }

  @Action({rawError: true})
  public async addPool(pool: Pool) {
    await ApiService.post<Pool>("pool", pool).toPromise();
  }

  @Action({rawError: true})
  public async editPool(pool: Pool) {
    await ApiService.put<Pool>(`pool/${pool.id}`, pool).toPromise();
  }

  @Action({rawError: true})
  public async editPoolOrder({id, order}: Required<Pick<Pool, "id" | "order">>) {
    await ApiService.put<{order: number}>(`pool/${id}/order`, {order}).toPromise();
  }

  @Action({rawError: true})
  public async deletePool(id: string) {
    await ApiService.delete<Pool>(`pool/${id}`).toPromise();
  }
}

const AggregatorStore = getModule(AggregatorModule);
export default AggregatorStore;
