import {Action, getModule, Module, Mutation, VuexModule} from "vuex-module-decorators";
import store from "./index";
import {Strategy} from "@/interfaces";
import {ApiService} from "@/services/api.service";
@Module({
  name: "_strategies-store",
  dynamic: true,
  namespaced: true,
  store
})
export class StrategiesModule extends VuexModule {
  private _strategies: Strategy[] = [];

  get strategies() {
    return this._strategies;
  }

  @Mutation
  private writeStrategies(strategies: Strategy[]) {
    this._strategies.length = 0;
    strategies.forEach((item) => this._strategies.push(item));
  }

  @Mutation
  private removeStrategies() {
    this._strategies.length = 0;
  }

  @Action({rawError: true})
  public async cleanStrategies() {
    this.removeStrategies();
  }

  @Action({rawError: true})
  public async getNetworkStrategies(networkId: string) {
    const strategies = (await ApiService.get<Strategy>(`strategy/?networkId=${networkId}`).toPromise()) as unknown;
    return strategies as Strategy[];
  }

  @Action({rawError: true})
  public async getStrategies() {
    const strategies = (await ApiService.get<Strategy>("strategy").toPromise()) as unknown;
    return strategies as Strategy[];
  }

  @Action({rawError: true})
  public async getPoolStrategies(poolId: string) {
    const strategies = (await ApiService.get<Strategy>(`strategy/?poolId=${poolId}`).toPromise()) as unknown;
    return strategies as Strategy[];
  }

  @Action({rawError: true})
  public async saveStrategies(strategies: Strategy[]) {
    this.writeStrategies(strategies);
  }

  @Action({rawError: true})
  public async updateStrategy(newStrategy: Strategy) {
    const strategyRef = this._strategies.find((p) => p.id === newStrategy.id);
    if (strategyRef) {
      Object.assign(strategyRef, newStrategy);
    }
  }

  @Action({rawError: true})
  public async getStrategyById(id: string): Promise<Strategy> {
    return (await ApiService.get<Strategy>(`strategy/${id}`).toPromise()) as Strategy;
  }

  @Action({rawError: true})
  public async addStrategy(strategy: Strategy) {
    await ApiService.post<Strategy>("strategy", strategy).toPromise();
  }

  @Action({rawError: true})
  public async editStrategy(strategy: Strategy) {
    await ApiService.put<Strategy>(`strategy/${strategy.id}`, strategy).toPromise();
  }

  @Action({rawError: true})
  public async deleteStrategy(id: string) {
    await ApiService.delete<Strategy>(`strategy/${id}`).toPromise();
  }
}

const StrategiesStore = getModule(StrategiesModule);
export default StrategiesStore;
