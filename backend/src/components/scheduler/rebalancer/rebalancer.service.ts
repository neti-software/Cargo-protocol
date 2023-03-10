import { StrategyService } from '@components/strategy/strategy.service';
import { Injectable, Logger } from '@nestjs/common';
import { AdminWallet } from '@shares/services/AdminWallet.service';
import { flatten, keyBy, map, toNumber } from 'lodash';
import { CalculateSwapAmountProps, StrategyPosition, SwapBPSDto } from './rebalancer.interfaces';
import { AdjustRangeService } from './services/adjust-range.service';
import { ReinvestFeesService } from './services/reinvest-fees.service';
import * as CargoService from '@/abis/CargoService.json';
import * as StakingProtocol from '@/abis/StakingProtocol.json';
import { FeeTier, UniswapV3Client } from '@shares/clients/uniswap-v3-client';
import { BigNumber, Contract } from 'ethers';
import * as Moment from 'moment';
import { TickService } from '@shares/services/Tick.service';

@Injectable()
export class RebalancerService {
  private readonly logger = new Logger(RebalancerService.name);

  constructor(
    private readonly adjustRangeService: AdjustRangeService,
    private readonly reinvestFeesService: ReinvestFeesService,
    private readonly strategyService: StrategyService
  ) {}

  async rebalance(): Promise<void> {
    const strategyPositions = await this.getStrategyPositions();

    await this.adjustRangeService.adjustStrategyRangesAccordingToSchedule(strategyPositions);

    await this.reinvestFeesService.reinvestFeesAndCalculateRewardsAccordingToSchedule(
      strategyPositions
    );

    return;
  }

  static getCargoServiceContract(strategyPosition: StrategyPosition): Contract {
    const adminWallet = new AdminWallet(
      strategyPosition.networkUrl,
      strategyPosition.transportProtocol
    );

    return adminWallet.contract(strategyPosition.cargoServiceAddress, JSON.stringify(CargoService));
  }

  static getStakingProtocolContract(strategyPosition: StrategyPosition): Contract {
    const adminWallet = new AdminWallet(
      strategyPosition.networkUrl,
      strategyPosition.transportProtocol
    );

    return adminWallet.contract(
      strategyPosition.stakingProtocolAddress,
      JSON.stringify(StakingProtocol)
    );
  }

  static getGasPrice(strategyPosition: StrategyPosition): Promise<BigNumber> {
    const adminWallet = new AdminWallet(
      strategyPosition.networkUrl,
      strategyPosition.transportProtocol
    );

    return adminWallet.getGasPrice();
  }

  static hasPeriodPassed(lastExecutionTimestap: Date, executionPeriod: string): boolean {
    const wasStrategyAdjustedFirstTime = !!lastExecutionTimestap;
    const isPeriodConfigurated = !!executionPeriod;

    if (isPeriodConfigurated) {
      const [amount, unit] = executionPeriod.split(' ');
      const isPeriodPassed = Moment().isAfter(
        Moment(lastExecutionTimestap).add(toNumber(amount), unit as Moment.DurationInputArg2)
      );

      return !wasStrategyAdjustedFirstTime || isPeriodPassed;
    }

    return false;
  }

  static calculateSwapAmount({
    token0Amount,
    token1Amount,
    tickRange,
    currentTick
  }: CalculateSwapAmountProps): SwapBPSDto {
    const sqrtPriceLower = TickService.sqrtPriceFromTick(tickRange[0]);
    const sqrtPriceUpper = TickService.sqrtPriceFromTick(tickRange[1]);
    const sqrtPrice = TickService.sqrtPriceFromTick(currentTick);

    const deltaLiquidity = 1 / (sqrtPrice - sqrtPriceLower + (1 / sqrtPrice - 1 / sqrtPriceUpper));

    const token0Price =
      (1 - deltaLiquidity * (sqrtPrice - sqrtPriceLower)) /
      (deltaLiquidity * (sqrtPrice - sqrtPriceLower));

    const token1Price = 1 / token0Price;
    let swapBPS = 0;
    let allForOne = false;

    if (token0Amount > 0) {
      swapBPS = 10000 - (((token0Amount / (1 + token0Price)) * token0Price) / token0Amount) * 10000;
      allForOne = true;
    } else {
      allForOne = false;
      swapBPS = 10000 - (((token1Amount / (1 + token1Price)) * token1Price) / token1Amount) * 10000;
    }

    return {
      allForOne,
      swapBPS
    };
  }

  private async getStrategyPositions(): Promise<StrategyPosition[]> {
    const strategies = await this.getStrategies();
    const strategiesWithRanges = await this.getStrategyRanges(strategies);
    const strategiesWithPoolData = await this.getUniswapPoolsData(strategiesWithRanges);

    return strategiesWithPoolData;
  }

  private async getStrategies(): Promise<StrategyPosition[]> {
    const strategies = await this.strategyService.getStrategiesWithPoolAndNetwork();

    const activeNetworkStrategies = strategies.filter((strategy) => strategy.pool.network.isActive);

    return activeNetworkStrategies.map((strategy) => ({
      strategyId: strategy.id,
      networkId: strategy.pool.network.id,
      rangePercentage: strategy.rangePercentage,
      strategyAddress: strategy.address,
      poolAddress: strategy.pool.uniswapPoolAddress,
      networkUrl: strategy.pool.network.networkUrl,
      transportProtocol: strategy.pool.network.transportProtocol,
      graphqlUrl: strategy.pool.network.graphqlUrl,
      cargoServiceAddress: strategy.pool.network.cargoServiceAddress,
      lastRangeAdjustTimestamp: strategy.lastExecutionTimestamp,
      lastReinvestFeesTimestamp: strategy.pool.network.lastExecutionTimestamp,
      adjustRangePeriod: strategy.executionPeriod,
      reinvestFeesPeriod: strategy.pool.network.executionPeriod,
      stakingProtocolAddress: strategy.stakingProtocolAddress
        ? strategy.stakingProtocolAddress
        : null,
      token0Address: strategy.pool.token0Address,
      token1Address: strategy.pool.token1Address,
      token0Name: strategy.pool.token0Name,
      token1Name: strategy.pool.token1Name,
      feesWeekly: strategy.feesWeekly,
      feesAnnual: strategy.feesAnnual
    }));
  }

  private async getStrategyRanges(
    strategyPositions: StrategyPosition[]
  ): Promise<StrategyPosition[]> {
    const strategiesToAdjustWithTicks = await Promise.all(
      map(strategyPositions, async (strategyPosition) => {
        const cargoServiceContract = RebalancerService.getCargoServiceContract(strategyPosition);

        const range = await cargoServiceContract.getCargoPoolTicks(
          strategyPosition.strategyAddress
        );
        return {
          ...strategyPosition,
          range
        };
      })
    );

    return strategiesToAdjustWithTicks;
  }

  private async getUniswapPoolsData(
    strategyPositions: StrategyPosition[]
  ): Promise<StrategyPosition[]> {
    const graphqlMap = keyBy(strategyPositions, 'graphqlUrl');

    const uniswapPoolsDataPromises = [];
    for (const graphqlUrl of Object.keys(graphqlMap)) {
      const uniswapV3Client = new UniswapV3Client(graphqlUrl);
      const poolDataPromise = uniswapV3Client.getPoolsData(map(strategyPositions, 'poolAddress'));
      uniswapPoolsDataPromises.push(poolDataPromise);
    }

    const uniswapPoolsData = flatten(await Promise.all(uniswapPoolsDataPromises));

    return strategyPositions.map((strategy) => {
      const poolData = uniswapPoolsData.find((pool) => pool.id === strategy.poolAddress);

      return {
        ...strategy,
        currentTick: toNumber(poolData.tick),
        tickSpacing: this.getTickSpacing(poolData.feeTier)
      };
    });
  }

  private getTickSpacing(feeTier: FeeTier): number {
    switch (feeTier) {
      case FeeTier.tier100:
        return 1;
      case FeeTier.tier500:
        return 10;
      case FeeTier.tier3000:
        return 60;
      case FeeTier.tier10000:
        return 200;
      default:
        throw new Error(
          `PositionPriceRangeService: missing tickSpacing configuration for feeTier='${feeTier}'`
        );
    }
  }
}
