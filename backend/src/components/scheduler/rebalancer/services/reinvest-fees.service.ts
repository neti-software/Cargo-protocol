import { Injectable, Logger } from '@nestjs/common';
import { filter, isString, uniq } from 'lodash';
import { StrategyPosition, NetworkBotStatuses } from '../rebalancer.interfaces';
import { RebalancerService } from '../rebalancer.service';
import { StrategyService } from '@components/strategy/strategy.service';
import { NetworkService } from '@components/network/network.service';
import { CalculateFeesService } from './calculate-fees.service';

@Injectable()
export class ReinvestFeesService {
  private readonly logger = new Logger(ReinvestFeesService.name);
  private readonly DELAY_FOR_TRANSACTION = 1000;

  constructor(
    private readonly strategyService: StrategyService,
    private readonly networkService: NetworkService,
    private readonly calculateFeesService: CalculateFeesService
  ) {}

  // so as not to send several transactions at once, because the network will not process them
  private transactionTimeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async reinvestFeesAndCalculateRewardsAccordingToSchedule(
    strategyPositions: StrategyPosition[]
  ): Promise<void> {
    await this.calculateFeesService.updateFeesAnnual(strategyPositions);

    const strategyPositionsToReinvestFees =
      this.getStrategyPositionsWithPassedSchedule(strategyPositions);

    const networkIds = strategyPositionsToReinvestFees.map((strategy) => strategy.networkId);
    const reinvestedNetworksIds = uniq(filter(networkIds, isString));
    if (reinvestedNetworksIds.length) {
      await this.networkService.updateLastExecutionDate(reinvestedNetworksIds);
    }

    if (strategyPositionsToReinvestFees.length > 0) {
      this.logger.log('ReinvestFess with adding them to database and calculateRewards started');

      let delay = 0;
      const statuses = [];
      for (const strategyPosition of strategyPositionsToReinvestFees) {
        delay = delay + this.DELAY_FOR_TRANSACTION;
        const status = await this.reinvestFeesAndCalculateRewards(strategyPosition, delay);
        statuses.push(status);
      }

      const statusesCount: NetworkBotStatuses = statuses.reduce(
        (result, currentValue) => {
          Object.keys(currentValue).forEach((item) => {
            if (item !== 'pool') {
              if (!result[item] || !result[item][currentValue[item]]) {
                result[item] = {
                  ...result[item],
                  [currentValue[item]]: {
                    count: 0,
                    pools: []
                  }
                };
              }

              result[item][currentValue[item]].count++;
              result[item][currentValue[item]].pools.push(currentValue.pool);
            }
          });
          return result;
        },
        {
          reinvestFeesStatus: {
            created: {
              count: 0,
              pools: []
            },
            error: {
              count: 0,
              pools: []
            }
          },
          calculateRewardsStatus: {
            created: {
              count: 0,
              pools: []
            },
            error: {
              count: 0,
              pools: []
            }
          }
        }
      );

      this.logger.log(
        `ReinvestFees: created ${statusesCount.reinvestFeesStatus.created.count} transactions [${statusesCount.reinvestFeesStatus.created.pools}] ` +
          `and errors occurred in ${statusesCount.reinvestFeesStatus.error.count} strategies [${statusesCount.reinvestFeesStatus.error.pools}] | ` +
          `CalculateRewards: created ${statusesCount.calculateRewardsStatus.created.count} transactions [${statusesCount.calculateRewardsStatus.created.pools}] ` +
          `and errors occurred in ${statusesCount.calculateRewardsStatus.error.count} strategies [${statusesCount.calculateRewardsStatus.error.pools}]`
      );
    }

    return;
  }

  private getStrategyPositionsWithPassedSchedule(
    strategyPositions: StrategyPosition[]
  ): StrategyPosition[] {
    return strategyPositions.filter((strategyPosition) =>
      RebalancerService.hasPeriodPassed(
        strategyPosition.lastReinvestFeesTimestamp,
        strategyPosition.reinvestFeesPeriod
      )
    );
  }

  private async calculateRewards(
    strategyPosition: StrategyPosition,
    delay: number
  ): Promise<string> {
    await this.transactionTimeout(delay);

    let calculateRewardsStatus: string;
    try {
      const stakingProtocolContract =
        RebalancerService.getStakingProtocolContract(strategyPosition);
      const tx = await stakingProtocolContract.calculateRewards({
        gasLimit: 18000000
      });
      this.logger.log(
        `Created transaction for calculateRewards for strategy with address='${strategyPosition.strategyAddress}', ` +
          `pool: ${strategyPosition.token0Name}/${strategyPosition.token1Name}\n` +
          `txHash: ${tx.hash}`
      );
      calculateRewardsStatus = 'created';
    } catch (error) {
      this.logger.error(
        `CalculateRewards failed for strategy with address='${strategyPosition.strategyAddress}', ` +
          `pool: ${strategyPosition.token0Name}/${strategyPosition.token1Name}\n` +
          `with error: ${error}`
      );
      calculateRewardsStatus = 'error';
    }

    return calculateRewardsStatus;
  }

  private async reinvestFeesAndCalculateRewards(
    strategyPosition: StrategyPosition,
    delay: number
  ): Promise<{
    reinvestFeesStatus: string;
    calculateRewardsStatus: string;
    pool: string;
  }> {
    await this.transactionTimeout(delay);

    const cargoServiceContract = RebalancerService.getCargoServiceContract(strategyPosition);

    let reinvestFeesStatus: string;
    let calculateRewardsStatus: string;
    try {
      await this.calculateFeesService.calculateFee(strategyPosition);

      if (strategyPosition.stakingProtocolAddress) {
        calculateRewardsStatus = await this.calculateRewards(
          strategyPosition,
          delay + this.DELAY_FOR_TRANSACTION
        );
      } else {
        calculateRewardsStatus = 'none';
      }

      const amounts = await cargoServiceContract.callStatic.reinvestFees(
        strategyPosition.strategyAddress,
        0,
        0,
        0
      );

      const gasPrice = await RebalancerService.getGasPrice(strategyPosition);
      const { swapBPS, allForOne } = RebalancerService.calculateSwapAmount({
        token0Amount: amounts[0],
        token1Amount: amounts[1],
        tickRange: strategyPosition.range,
        currentTick: strategyPosition.currentTick
      });
      const tx = await cargoServiceContract.reinvestFees(
        strategyPosition.strategyAddress,
        swapBPS.toFixed(0),
        allForOne,
        gasPrice,
        { gasLimit: 18000000 }
      );
      this.logger.log(
        `Created transaction for reinvestFees for strategy with address='${strategyPosition.strategyAddress}', ` +
          `pool: ${strategyPosition.token0Name}/${strategyPosition.token1Name}\n` +
          `txHash: ${tx.hash}`
      );
      reinvestFeesStatus = 'created';
    } catch (error) {
      this.logger.error(
        `ReinvestFees failed for strategy with address='${strategyPosition.strategyAddress}', ` +
          `pool: ${strategyPosition.token0Name}/${strategyPosition.token1Name}\n` +
          `with error: ${error}`
      );
      reinvestFeesStatus = 'error';
    }

    return {
      reinvestFeesStatus,
      calculateRewardsStatus,
      pool: `${strategyPosition.token0Name}/${strategyPosition.token1Name}`
    };
  }
}
