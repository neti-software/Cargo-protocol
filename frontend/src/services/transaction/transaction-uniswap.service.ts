import {Pool, Strategy, TokenTvl} from "@/interfaces";
import cargoService from "@/abis/CargoService.json";
import AggregatorStore from "@/store/aggregator.store";
import TransactionService from "@/services/transaction/transaction.service";
import ContractService from "@/services/contract.service";
import {ContractInterface, providers} from "ethers";
import BigNumber from "bignumber.js";
import WalletStore from "@/store/wallet.store";
import WalletAuthService from "@/services/wallet-auth.service";

const TOKEN_DECIMAL_PLACES_18: number = 18;
const TOKEN_DECIMAL_PLACES_6: number = 6;

export default class TransactionUniswapService {
  public static async deposit(pool: Pool, strategy: Strategy, liquidity: BigNumber) {
    let cargoServiceContract = ContractService.getContract(
      cargoService as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      AggregatorStore.currentNetwork.cargoServiceAddress
    );
    const signer = new providers.Web3Provider(WalletAuthService[WalletStore.currentProvider].provider).getSigner();

    TransactionService.walletInfo$.next(TransactionService.walletInfo);
    TransactionService.stage$.next("Deposit authentication");
    TransactionService.progress$.next(65);
    await WalletAuthService[WalletStore.currentProvider].requestAccount();
    TransactionService.progress$.next(75);
    cargoServiceContract = cargoServiceContract.connect(signer);
    const output = await cargoServiceContract.callStatic.deposit(
      strategy.address,
      pool.token0Address,
      pool.token1Address,
      liquidity.toFixed(0)
    );
    const tx = await cargoServiceContract.deposit(strategy.address, pool.token0Address, pool.token1Address, liquidity.toFixed(0));
    TransactionService.walletInfo$.next("");
    TransactionService.stage$.next("Depositing");
    const interval = setInterval(() => {
      if (TransactionService.progress$.value < 90) {
        TransactionService.progress$.next(TransactionService.progress$.value + 1);
      }
    }, 1000);
    const txResult = await tx.wait();
    clearInterval(interval);
    TransactionService.progress$.next(100);
    TransactionService.stage$.next("Success");
    return {
      transactionHash: txResult.transactionHash,
      gasUsed: txResult.gasUsed,
      liquidityMinted: new BigNumber(output.liquidityMinted.toString()).div(1e18).toString().slice(0, 10)
    };
  }

  public static async withdraw(strategy: Strategy, liquidity: BigNumber) {
    TransactionService.walletInfo$.next(TransactionService.walletInfo);
    TransactionService.stage$.next("Withdraw approval");
    TransactionService.progress$.next(40);
    const v3GuniContract = ContractService.getContract(
      cargoService as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      AggregatorStore.currentNetwork.cargoServiceAddress
    );
    const signer = new providers.Web3Provider(WalletAuthService[WalletStore.currentProvider].provider).getSigner();

    await WalletAuthService[WalletStore.currentProvider].requestAccount();

    const v3GuniContractConntected = v3GuniContract.connect(signer);

    const output = await v3GuniContractConntected.callStatic.withdraw(strategy.address, liquidity.toFixed(0));

    const tx = await v3GuniContractConntected.withdraw(strategy.address, liquidity.toFixed(0));
    TransactionService.walletInfo$.next("");
    TransactionService.stage$.next("Withdrawing");
    TransactionService.progress$.next(70);

    const interval = setInterval(() => {
      if (TransactionService.progress$.value < 90) {
        TransactionService.progress$.next(TransactionService.progress$.value + 2);
      }
    }, 1000);
    const txResult = await tx.wait();
    clearInterval(interval);
    TransactionService.progress$.next(100);
    TransactionService.stage$.next("Success");

    return {
      transactionHash: txResult.transactionHash,
      gasUsed: txResult.gasUsed,
      amount0: new BigNumber(output.amount0.toString()).div(1e18).toString().slice(0, 10),
      amount1: new BigNumber(output.amount1.toString()).div(1e18).toString().slice(0, 10),
      liquidityBurned: new BigNumber(output.liquidityBurned.toString()).div(1e18).toString().slice(0, 10)
    };
  }

  public static async getTokensAmountForUser(strategy: Strategy) {
    const cargoServiceContract = ContractService.getContract(
      cargoService as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      AggregatorStore.currentNetwork.cargoServiceAddress
    );
    const signer = new providers.Web3Provider(WalletAuthService[WalletStore.currentProvider].provider).getSigner();
    const amounts = await cargoServiceContract.connect(signer).getTokensAmount(strategy.address);
    return {
      amount0: new BigNumber(amounts.amount0.toString()),
      amount1: new BigNumber(amounts.amount1.toString()),
      liquidity: new BigNumber(amounts.liquidity.toString())
    };
  }

  public static async getTokensAmountForStrategy(strategy: Strategy) {
    const cargoServiceContract = ContractService.getContract(
      cargoService as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      AggregatorStore.currentNetwork.cargoServiceAddress
    );
    const amounts = await cargoServiceContract.GUniCurrent(strategy.address);
    return {
      amount0: new BigNumber(amounts._amount0Current.toString()),
      amount1: new BigNumber(amounts._amount1Current.toString()),
      liquidity: new BigNumber(amounts._totalSupply.toString())
    };
  }

  public static async getCalculatedAmountsForUser(strategy: Strategy) {
    const userAmounts = await TransactionUniswapService.getTokensAmountForUser(strategy);
    const strategyAmounts = await TransactionUniswapService.getTokensAmountForStrategy(strategy);

    const userLiquidity = +new BigNumber(userAmounts.liquidity.toString()).div(new BigNumber(10).pow(18)).toNumber().toPrecision(3);
    const strategyLiquidity = +new BigNumber(strategyAmounts.liquidity.toString()).div(new BigNumber(10).pow(18)).toNumber().toPrecision(3);

    // check if tokens have 6 or 18 decimals
    let strategyToken0Amount: number;
    if (strategyAmounts.amount0.e! <= TOKEN_DECIMAL_PLACES_6) {
      strategyToken0Amount = +new BigNumber(strategyAmounts.amount0.toString())
        .multipliedBy(new BigNumber(10).pow(12))
        .div(new BigNumber(10).pow(18))
        .toNumber()
        .toPrecision(3);
    } else {
      strategyToken0Amount = +new BigNumber(strategyAmounts.amount0.toString()).div(new BigNumber(10).pow(18)).toNumber().toPrecision(3);
    }

    let strategyToken1Amount: number;
    if (strategyAmounts.amount1.e! <= TOKEN_DECIMAL_PLACES_6) {
      strategyToken1Amount = +new BigNumber(strategyAmounts.amount1.toString())
        .multipliedBy(new BigNumber(10).pow(12))
        .div(new BigNumber(10).pow(18))
        .toNumber()
        .toPrecision(3);
    } else {
      strategyToken1Amount = +new BigNumber(strategyAmounts.amount1.toString()).div(new BigNumber(10).pow(18)).toNumber().toPrecision(3);
    }

    const userToken0Amount = +((userLiquidity / strategyLiquidity) * strategyToken0Amount).toPrecision(3);
    const userToken1Amount = +((userLiquidity / strategyLiquidity) * strategyToken1Amount).toPrecision(3);

    return {
      userToken0Amount,
      userToken1Amount,
      userLiquidity
    };
  }

  public static async getMaxTokensLiquidity(amount0: BigNumber, amount1: BigNumber, guniAddress: string) {
    const cargoServiceContract = ContractService.getContract(
      cargoService as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      AggregatorStore.currentNetwork.cargoServiceAddress
    );
    const signer = new providers.Web3Provider(WalletAuthService[WalletStore.currentProvider].provider).getSigner();
    const cargoServiceContractConntected = await cargoServiceContract.connect(signer);
    const maxTokensData = await cargoServiceContractConntected.getMintLiquidity(amount0.toFixed(0), amount1.toFixed(0), guniAddress);
    const max0Liquidity = new BigNumber(maxTokensData._maxMintLiqAmount0.toString());
    const max1Liquidity = new BigNumber(maxTokensData._maxMintLiqAmount1.toString());
    if (max0Liquidity.lt(max1Liquidity)) {
      return max0Liquidity;
    } else {
      return max1Liquidity;
    }
  }

  public static async getCurrentTokensAmount(guniAddress: string) {
    const cargoServiceContract = ContractService.getContract(
      cargoService as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      AggregatorStore.currentNetwork.cargoServiceAddress
    );
    const signer = new providers.Web3Provider(WalletAuthService[WalletStore.currentProvider].provider).getSigner();
    const cargoServiceContractConntected = await cargoServiceContract.connect(signer);
    const totalSupplyData = await cargoServiceContractConntected.GUniCurrent(guniAddress);
    return {
      totalSupply: new BigNumber(totalSupplyData._totalSupply.toString()),
      token0Amount: new BigNumber(totalSupplyData._amount0Current.toString()),
      token1Amount: new BigNumber(totalSupplyData._amount1Current.toString())
    };
  }

  public static calculateApy(fees: string, totalFee: number, feesLength: number): string {
    switch (fees) {
      case "weekly":
        return `${(totalFee * 100 * (1460 / feesLength)).toFixed(2)}`;
      case "annual":
        return `${(totalFee * 100 * (365 / feesLength)).toFixed(2)}`;
      default:
        return "0";
    }
  }

  public static async getStrategyTvlUSD(tokensTvl: TokenTvl[], strategy: Strategy): Promise<number> {
    const token0Tvl = tokensTvl?.find(({id}) => id === strategy.token0Address!);
    const token1Tvl = tokensTvl?.find(({id}) => id === strategy.token1Address!);
    const {amount0, amount1} = await TransactionUniswapService.getTokensAmountForStrategy(strategy);

    const token0USD = new BigNumber(+new BigNumber(amount0.toString()).div(new BigNumber(10).pow(18)).toNumber().toPrecision(4))
      .multipliedBy(token0Tvl?.singleAssetTvl || 0)
      .toNumber();
    const token1USD = new BigNumber(+new BigNumber(amount1.toString()).div(new BigNumber(10).pow(18)).toNumber().toPrecision(4))
      .multipliedBy(token1Tvl?.singleAssetTvl || 0)
      .toNumber();
    return +(token0USD + token1USD).toFixed(2);
  }

  public static async getStrategiesTvl(tokensTvl: TokenTvl[], strategies: Strategy[]) {
    const strategiesTvl: {pool: string; tvl: number; order: number}[] = [];

    for (let i = 0; i < strategies.length; i++) {
      const pool = AggregatorStore.pools.find((pool) => pool.id === strategies[i].poolId);
      strategies[i] = {...strategies[i], token0Address: pool!.token0Address, token1Address: pool!.token1Address};
      const totalTvlUSD = await this.getStrategyTvlUSD(tokensTvl, strategies[i]);
      const poolName = `${pool!.token0Name}/${pool!.token1Name}`;
      strategiesTvl.push({pool: poolName, tvl: totalTvlUSD, order: pool!.order as number});
    }

    return strategiesTvl.sort((a, b) => a.order - b.order);
  }
}
