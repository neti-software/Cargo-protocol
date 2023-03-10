import {Action, getModule, Module, Mutation, VuexModule} from "vuex-module-decorators";
import store from "./index";
import AggregatorStore from "@/store/aggregator.store";
import StrategiesStore from "@/store/strategies.store";
import AssetsStore from "@/store/assets.store";
import {CeloPair} from "@/interfaces";
import TransactionCeloService from "@/services/transaction/transaction-celo.service";
import NumbersService from "@/services/numbers.service";

@Module({
  name: "_celo-store",
  dynamic: true,
  namespaced: true,
  store
})
export class CeloModule extends VuexModule {
  private _celoPairs: CeloPair[] = [];

  get celoPairs() {
    return this._celoPairs;
  }

  @Mutation
  private writeCeloPairs(celoPairs: CeloPair[]) {
    this._celoPairs.length = 0;
    celoPairs.forEach((item) => this._celoPairs.push(item));
  }

  @Action({rawError: true})
  public async saveCeloPairs(celoPairs: CeloPair[]) {
    this.writeCeloPairs(celoPairs);
  }

  @Action({rawError: true})
  public async getCeloPairs() {
    const celoPairs: CeloPair[] = [];

    const celo = AssetsStore.assets.find((asset) => asset.name.toLowerCase() == "celo");
    if (celo) {
      const celoStrategies = StrategiesStore.strategies.filter(
        (strategy) => [strategy.token0Address, strategy.token1Address].includes(celo.address) && !!strategy.stakingProtocolAddress
      );

      for (let i = 0; i < celoStrategies.length; i++) {
        const pool = AggregatorStore.pools.find(
          (pool) => pool.token0Address == celoStrategies[i].token0Address && pool.token1Address == celoStrategies[i].token1Address
        );

        const balanceOf = await TransactionCeloService.balanceOf(celoStrategies[i].stakingProtocolAddress!);
        const rewardsAmount = await TransactionCeloService.getRewardsAmount(celoStrategies[i].stakingProtocolAddress!);
        const rewardRate = await TransactionCeloService.getRewardRateBPS(celoStrategies[i].stakingProtocolAddress!);

        const celoPair: CeloPair = {
          token0Address: celoStrategies[i].token0Address!,
          token0Name: pool!.token0Name,
          token1Address: celoStrategies[i].token1Address!,
          token1Name: pool!.token1Name,
          stakingProtocolAddress: celoStrategies[i].stakingProtocolAddress!,
          balanceOf: NumbersService.parseNumericValue(balanceOf),
          rewardsAmount: NumbersService.parseNumericValue(rewardsAmount),
          rewardsRate: Number(rewardRate),
          fee: pool!.fee!
        };

        celoPairs.push(celoPair);
      }
    }

    await this.saveCeloPairs(celoPairs);
  }
}

const CeloPairsStore = getModule(CeloModule);
export default CeloPairsStore;
