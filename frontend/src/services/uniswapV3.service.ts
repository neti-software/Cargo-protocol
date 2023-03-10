import BigNumber from "bignumber.js";
import WalletStore from "@/store/wallet.store";
import {Pool, Strategy, Token, PoolWithTotalValueLocked, TokenTvl} from "@/interfaces";
import AggregatorStore from "@/store/aggregator.store";
import StrategiesStore from "@/store/strategies.store";
import TransactionService from "@/services/transaction/transaction.service";
import TransactionUniswapService from "@/services/transaction/transaction-uniswap.service";
import CommonStore from "@/store/common.store";
import {GraphqlQueriesService} from "./graphql.service";
import NumbersService from "./numbers.service";
import AssetsStore from "@/store/assets.store";
import AdminsStore from "@/store/admins.store";
import CeloStore from "@/store/celo.store";
import {AdminRole} from "@/interfaces";

const TOKEN_DECIMAL_PLACES_6: number = 6;
const TOKEN_DECIMAL_PLACES_18: number = 18;

export default abstract class UniswapV3Service {
  public static async initData() {
    CommonStore.startLoading();
    if (AggregatorStore.currentNetwork) {
      await GraphqlQueriesService.init();
      await StrategiesStore.cleanStrategies();
      await AggregatorStore.cleanPools();
      await this.fetchUniswapData();

      const poolsDeposited = AggregatorStore.pools.filter((pool) => pool.isActive && pool.myTVL && +pool.myTVL !== 0);
      if (poolsDeposited.length > 0) CommonStore.saveNewUser(false);
      else CommonStore.saveNewUser(true);
    }
    CommonStore.stopLoading();
  }

  public static async refreshUniswapData(pool: Pool, strategy: Strategy) {
    CommonStore.startLoading();
    if (AggregatorStore.currentNetwork) {
      const updatedTokensTvl = await GraphqlQueriesService.getTokensTvl([pool.token0Address, pool.token1Address]);
      const updatedPoolTvl = await GraphqlQueriesService.getPoolsTvl([pool.uniswapPoolAddress]);

      const updatedStrategy = await this.getDetailedStrategy(pool, strategy, updatedTokensTvl);
      await StrategiesStore.updateStrategy(updatedStrategy);

      const updatedPool = this.getDetailedPool(pool, StrategiesStore.strategies, updatedPoolTvl);
      await AggregatorStore.updatePool(updatedPool);

      AssetsStore.cleanAssets();
      await this.getAssets();

      const poolsDeposited = AggregatorStore.pools.filter((pool) => pool.isActive && pool.myTVL && +pool.myTVL !== 0);
      if (poolsDeposited.length > 0) CommonStore.saveNewUser(false);
      else CommonStore.saveNewUser(true);
    }
    CommonStore.stopLoading();
  }

  public static async fetchUniswapData() {
    CommonStore.startLoading();

    const pools: Pool[] = await AggregatorStore.getNetworkPools(AggregatorStore.currentNetwork.id!);

    const tokensAddreses = pools.reduce((acc: string[], {token0Address, token1Address}) => [...acc, token0Address, token1Address], []);
    const tokensTvl = await GraphqlQueriesService.getTokensTvl(tokensAddreses);
    const strategies = await StrategiesStore.getNetworkStrategies(AggregatorStore.currentNetwork.id!);

    const strategiesDetailedPromises: Promise<Strategy>[] = [];
    for (let i = 0; i < pools.length; i++) {
      if (pools[i].isActive) {
        const poolStrategies: Strategy[] = strategies.filter((strategy) => strategy.poolId === pools[i].id!);

        if (poolStrategies.length > 0) {
          for (let j = 0; j < poolStrategies.length; j++) {
            strategiesDetailedPromises.push(this.getDetailedStrategy(pools[i], poolStrategies[j], tokensTvl));
          }
        }
      }
    }
    const poolAddreses = pools.map(({uniswapPoolAddress}) => uniswapPoolAddress || "");
    const poolsTvl = await GraphqlQueriesService.getPoolsTvl(poolAddreses);
    const strategiesDetailed = await Promise.all(strategiesDetailedPromises);
    await StrategiesStore.saveStrategies(strategiesDetailed);

    const detailedPools = pools.map((pool) => this.getDetailedPool(pool, strategiesDetailed, poolsTvl));
    await AggregatorStore.savePools(detailedPools);
    await this.getAssets();

    if (CommonStore.adminRole === AdminRole.ADMIN || CommonStore.adminRole === AdminRole.CELO) await CeloStore.getCeloPairs();
    CommonStore.stopLoading();
  }

  public static async fetchAdminData() {
    CommonStore.startLoading();
    await GraphqlQueriesService.init();
    await Promise.all([StrategiesStore.cleanStrategies(), AggregatorStore.cleanPools(), AggregatorStore.cleanNetworks()]);
    await AggregatorStore.fetchNetworks();
    const [tokens, pools, strategies, admins] = await Promise.all([
      AssetsStore.getAssets(AggregatorStore.currentNetwork.id!),
      AggregatorStore.getNetworkPools(),
      StrategiesStore.getStrategies(),
      AdminsStore.getAdmins()
    ]);

    const updatedStrategies = strategies.map((strategy) => {
      let apyFromFeesWeekly = "0 %";
      if (strategy.feesWeekly && strategy.totalFeesWeekly) {
        const feesWeeklyLength = (strategy.feesWeekly! as string).replace(/},{/g, "}|{").split("|").length;
        apyFromFeesWeekly = TransactionUniswapService.calculateApy("weekly", +strategy.totalFeesWeekly, feesWeeklyLength);
      }

      let apyFromFeesAnnual = "0 %";
      if (strategy.feesAnnual && strategy.totalFeesAnnual) {
        const feesAnnualLength = (strategy.feesAnnual! as string).replace(/},{/g, "}|{").split("|").length;
        apyFromFeesAnnual = TransactionUniswapService.calculateApy("annual", +strategy.totalFeesAnnual, feesAnnualLength);
      }

      return {
        ...strategy,
        apyFromFeesWeekly,
        apyFromFeesAnnual
      };
    });

    await Promise.all([
      AssetsStore.saveAssets(tokens),
      AggregatorStore.savePools(pools),
      StrategiesStore.saveStrategies(updatedStrategies),
      AdminsStore.saveAdmins(admins)
    ]);
    CommonStore.stopLoading();
  }

  public static async getAssets() {
    const assets = await AssetsStore.getAssets(AggregatorStore.currentNetwork.id!);
    const assetsUpdated: Token[] = [];

    const assetsBalances = new Map();

    const assetsBalancesPromises = assets.map(({address}) =>
      TransactionService.balanceOfToken(address).then((balance) => {
        assetsBalances.set(address, balance);
      })
    );

    await Promise.all(assetsBalancesPromises);

    for (let i = 0; i < assets.length; i++) {
      let balance = assetsBalances.get(assets[i].address);

      // check if token has 6 decimals
      if (balance.e <= TOKEN_DECIMAL_PLACES_6) {
        balance = balance = new BigNumber(balance.toString()).multipliedBy(new BigNumber(10).pow(12));
      }
      let myAmount = +new BigNumber(balance.toString()).div(new BigNumber(10).pow(18)).toNumber().toPrecision(4);

      StrategiesStore.strategies
        .filter((strategy) => assets[i].address === strategy.token0Address)
        .map((strategy) => (myAmount = myAmount + strategy.token0Amount!));

      StrategiesStore.strategies
        .filter((strategy) => assets[i].address === strategy.token1Address)
        .map((strategy) => (myAmount = myAmount + strategy.token1Amount!));

      assetsUpdated.push({
        myAmount: NumbersService.parseNumericValue(+myAmount.toPrecision(3)),
        myAmountWallet: NumbersService.parseNumericValue(
          +new BigNumber(balance.toString()).div(new BigNumber(10).pow(18)).toNumber().toPrecision(3)
        ),
        ...assets[i]
      });
    }

    await AssetsStore.saveAssets(assetsUpdated);
  }

  private static async getDetailedStrategy(pool: Pool, strategy: Strategy, tokensTvl: TokenTvl[]): Promise<Strategy> {
    let apyFromFeesWeekly = "0";
    if (strategy.feesWeekly && strategy.totalFeesWeekly) {
      const feesWeeklyLength = (strategy.feesWeekly! as string).replace(/},{/g, "}|{").split("|").length;
      apyFromFeesWeekly = TransactionUniswapService.calculateApy("weekly", +strategy.totalFeesWeekly, feesWeeklyLength);
    }

    let apyFromFeesAnnual = "0";
    if (strategy.feesAnnual && strategy.totalFeesAnnual) {
      const feesAnnualLength = (strategy.feesAnnual! as string).replace(/},{/g, "}|{").split("|").length;
      apyFromFeesAnnual = TransactionUniswapService.calculateApy("annual", +strategy.totalFeesAnnual, feesAnnualLength);
    }

    strategy = {...strategy, apyFromFeesWeekly, apyFromFeesAnnual};

    if (WalletStore.isAuthenticated) {
      const calculatedAmounts = await TransactionUniswapService.getCalculatedAmountsForUser(strategy);

      const token0Tvl = tokensTvl?.find(({id}) => id === pool.token0Address);
      const token1Tvl = tokensTvl?.find(({id}) => id === pool.token1Address);
      const token0USD = new BigNumber(calculatedAmounts.userToken0Amount.toString())
        .multipliedBy(token0Tvl?.singleAssetTvl || 0)
        .toNumber();
      const token1USD = new BigNumber(calculatedAmounts.userToken1Amount.toString())
        .multipliedBy(token1Tvl?.singleAssetTvl || 0)
        .toNumber();

      const myTVL = token0USD + token1USD;

      return {
        ...strategy,
        myTVL: NumbersService.parseNumericValueTVL(myTVL),
        token0Address: pool.token0Address,
        token0Amount: calculatedAmounts.userToken0Amount,
        token0USD,
        token1Address: pool.token1Address,
        token1Amount: calculatedAmounts.userToken1Amount,
        token1USD,
        liquidity: calculatedAmounts.userLiquidity
      };
    } else {
      return {
        ...strategy,
        myTVL: "0"
      };
    }
  }

  private static getDetailedPool(pool: Pool, strategies: Strategy[], totalValues: PoolWithTotalValueLocked[]): Pool {
    const {myTVL, APY, token0Amount, token1Amount} = strategies.reduce(
      ({myTVL, APY, token0Amount, token1Amount}, strategy) => {
        if (strategy.poolId === pool.id) {
          return {
            token0Amount: token0Amount + strategy.token0Amount!,
            token1Amount: token1Amount + strategy.token1Amount!,
            myTVL: myTVL + Number(strategy.myTVL),
            APY: APY + Number(strategy.apyFromFeesAnnual)
          };
        }
        return {myTVL, APY, token0Amount, token1Amount};
      },
      {myTVL: 0, APY: 0, token0Amount: 0, token1Amount: 0}
    );

    const poolStrategies = StrategiesStore.strategies.filter((strategy) => strategy.poolId === pool.id);

    const totalValueLockedUSD: string | undefined = totalValues.find(({id}) => id === pool.uniswapPoolAddress)?.totalValueLockedUSD;

    return {
      ...pool,
      token0Amount,
      token1Amount,
      myTVL: NumbersService.parseNumericValueTVL(myTVL),
      TVL: totalValueLockedUSD ? NumbersService.parseNumericValue(+totalValueLockedUSD) : "0",
      APY: APY / poolStrategies.length
    };
  }
}
