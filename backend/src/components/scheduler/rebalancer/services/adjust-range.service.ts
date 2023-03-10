import { Injectable, Logger } from '@nestjs/common';
import { TickService } from '@shares/services/Tick.service';
import { filter, uniq, isString } from 'lodash';
import { TickRange, StrategyPosition } from '../rebalancer.interfaces';
import { RebalancerService } from '../rebalancer.service';
import { StrategyService } from '@components/strategy/strategy.service';

@Injectable()
export class AdjustRangeService {
  private readonly logger = new Logger(AdjustRangeService.name);
  private readonly MAX_DEVIATION_OF_TICK_FROM_THE_MIDDLE_OF_RANGE = 1;

  constructor(private readonly strategyService: StrategyService) {}

  async adjustStrategyRangesAccordingToSchedule(
    strategyPositions: StrategyPosition[]
  ): Promise<void> {
    const strategyPositionsWithPassedSchedule =
      this.getStrategyPositionsWithPassedSchedule(strategyPositions);

    const strategyPositionsToAdjust = await this.getStrategyPositionsWithNewRanges(
      strategyPositionsWithPassedSchedule
    );

    const strategyIds = strategyPositionsToAdjust.map((strategy) => strategy.strategyId);
    const adjustedStrategiesIds = uniq(filter(strategyIds, isString));
    if (adjustedStrategiesIds.length) {
      await this.strategyService.updateLastExecutionDate(adjustedStrategiesIds);
    }

    const rebalancePromises = [];
    for (const strategyPosition of strategyPositionsToAdjust) {
      rebalancePromises.push(this.rebalanceTickRange(strategyPosition));
    }

    if (rebalancePromises.length > 0) {
      this.logger.log('RebalanceTickRange started');
    }

    const statuses = await Promise.all(rebalancePromises);
    const statusesCount = statuses.reduce((result, currentValue) => {
      result[currentValue] = (result[currentValue] || 0) + 1;
      return result;
    }, {});

    if (rebalancePromises.length > 0) {
      this.logger.log(
        `RebalanceTickRange: created ${
          statusesCount.created ? statusesCount.created : 0
        } transactions and errors occurred in ${
          statusesCount.error ? statusesCount.error : 0
        } strategies`
      );
    }

    return;
  }

  private getStrategyPositionsWithPassedSchedule(
    strategyPositions: StrategyPosition[]
  ): StrategyPosition[] {
    return filter(strategyPositions, (strategyPosition) =>
      RebalancerService.hasPeriodPassed(
        strategyPosition.lastRangeAdjustTimestamp,
        strategyPosition.adjustRangePeriod
      )
    );
  }

  private getStrategyPositionsWithNewRanges(strategyPositions: StrategyPosition[]) {
    return strategyPositions.reduce((acc: StrategyPosition[], strategyPosition) => {
      const newRange = this.calculateNewRangeIfNeeded(strategyPosition);
      if (newRange) {
        return [
          ...acc,
          {
            ...strategyPosition,
            newRange
          }
        ];
      }
      return acc;
    }, []);
  }

  private calculateNewRangeIfNeeded(strategyPosition: StrategyPosition): TickRange | null {
    const currentTick = strategyPosition.currentTick;
    const tickLower = strategyPosition.range[0];
    const tickUpper = strategyPosition.range[1];
    const tickSpacing = strategyPosition.tickSpacing;

    const currentRangeDeviation = this.getRangePercentageDiviationFromTick(
      currentTick,
      tickLower,
      tickUpper
    );

    if (currentRangeDeviation < this.MAX_DEVIATION_OF_TICK_FROM_THE_MIDDLE_OF_RANGE) {
      return;
    }

    const currentPrice = Math.pow(1.0001, currentTick);
    const lowerPrice = currentPrice * ((100 - strategyPosition.rangePercentage) / 100);
    const upperPrice = currentPrice * ((100 + strategyPosition.rangePercentage) / 100);

    const exactTickLower = TickService.tickFromPrice(lowerPrice);
    const exactTickUpper = TickService.tickFromPrice(upperPrice);

    const tickLowerRounded = this.roundTick(exactTickLower, tickSpacing);
    const tickUpperRounded = this.roundTick(exactTickUpper, tickSpacing);

    const roundedRangeDeviation = this.getRangePercentageDiviationFromTick(
      currentTick,
      tickLowerRounded,
      tickUpperRounded
    );

    const minRangeDiviation = Math.min(currentRangeDeviation, roundedRangeDeviation);

    if (minRangeDiviation !== currentRangeDeviation) {
      return [tickLowerRounded, tickUpperRounded];
    }

    return;
  }

  private getRangePercentageDiviationFromTick(
    tick: number,
    tickLower: number,
    tickUpper: number
  ): number {
    const halfRangeWidth = Math.abs(tickUpper - tickLower) / 2;
    const middleOfRange = (tickLower + tickUpper) / 2;
    return Math.abs(middleOfRange - tick) / halfRangeWidth;
  }

  private roundTick(tick: number, tickSpacing: number): number {
    return tickSpacing * Math.round(tick / tickSpacing);
  }

  private async rebalanceTickRange(strategyPosition: StrategyPosition): Promise<string> {
    const cargoServiceContract = RebalancerService.getCargoServiceContract(strategyPosition);

    let transactionStatus: string;
    try {
      const amounts = await cargoServiceContract.callStatic.rebalanceTickRange(
        strategyPosition.strategyAddress,
        strategyPosition.newRange[0],
        strategyPosition.newRange[1],
        0,
        0
      );

      const { swapBPS, allForOne } = RebalancerService.calculateSwapAmount({
        tickRange: strategyPosition.newRange,
        currentTick: strategyPosition.currentTick,
        token0Amount: amounts[0],
        token1Amount: amounts[1]
      });

      const tx = await cargoServiceContract.rebalanceTickRange(
        strategyPosition.strategyAddress,
        strategyPosition.newRange[0],
        strategyPosition.newRange[1],
        swapBPS.toFixed(0),
        allForOne,
        { gasLimit: 18000000 }
      );
      this.logger.log(
        `Created transaction for rebalanceTickRange for strategy with address='${strategyPosition.strategyAddress}', ` +
          `pool: ${strategyPosition.token0Name}/${strategyPosition.token1Name}\n` +
          `txHash: ${tx.hash}`
      );
      transactionStatus = 'created';
    } catch (error) {
      this.logger.error(
        `RebalanceTickRange failed for strategy with address='${strategyPosition.strategyAddress}', ` +
          `pool: ${strategyPosition.token0Name}/${strategyPosition.token1Name}\n` +
          `with error: ${error}`
      );
      transactionStatus = 'error';
    }

    return transactionStatus;
  }
}
