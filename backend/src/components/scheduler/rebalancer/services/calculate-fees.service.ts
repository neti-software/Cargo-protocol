import { Injectable, Logger } from '@nestjs/common';
import { StrategyPosition, TokenTvl } from '../rebalancer.interfaces';
import { RebalancerService } from '../rebalancer.service';
import BigNumber from 'bignumber.js';
import { UniswapV3Client } from '@shares/clients/uniswap-v3-client';
import { StrategyService } from '@components/strategy/strategy.service';
import * as Moment from 'moment';

@Injectable()
export class CalculateFeesService {
  private readonly logger = new Logger(CalculateFeesService.name);

  constructor(private readonly strategyService: StrategyService) {}

  public async updateFeesAnnual(strategyPositions: StrategyPosition[]): Promise<void> {
    const startDay = Moment(new Date()).startOf('day');
    const startDayWith30Min = Moment(startDay).add(30, 'minutes' as Moment.DurationInputArg2);

    if (Moment(new Date()).isBetween(startDay, startDayWith30Min)) {
      for (const strategyPosition of strategyPositions) {
        if (strategyPosition.feesAnnual) {
          const strategyFeesAnnual = (strategyPosition.feesAnnual as string)
            .replace(/},{/g, '}|{')
            .split('|')
            .map((x: string | { fee: number; date: string }) => {
              x = JSON.parse(x as string);
              const y = x as { fee: number; date: string };
              y.fee = +y.fee;
              return y;
            });

          const feeFromYesterdayExists = strategyFeesAnnual.some(
            (strategy) => strategy.date == Moment(new Date()).add(-1, 'days').format('YYYY-MM-DD')
          );

          if (!feeFromYesterdayExists) {
            await this.strategyService.updateFeesAnnual(strategyPosition.strategyId);
            await this.strategyService.calculateApyFromYesterday(strategyPosition.strategyId);
          }
        } else {
          await this.strategyService.updateFeesAnnual(strategyPosition.strategyId);
          await this.strategyService.calculateApyFromYesterday(strategyPosition.strategyId);
        }
      }
    }

    return;
  }

  public async calculateFee(strategyPosition: StrategyPosition): Promise<void> {
    const cargoServiceContract = RebalancerService.getCargoServiceContract(strategyPosition);

    try {
      const data = await cargoServiceContract.computeFeesEarned(strategyPosition.strategyAddress);

      const { token0Tvl, token1Tvl } = await this.getTokensTvl(strategyPosition);
      const tvl = await this.getStrategyTvlUSD(strategyPosition, {
        token0Tvl,
        token1Tvl
      });

      const fee0USD = +new BigNumber(data.fee0.toString())
        .div(1e18)
        .multipliedBy(token0Tvl?.singleAssetTvl || 0)
        .toPrecision();
      const fee1USD = +new BigNumber(data.fee1.toString())
        .div(1e18)
        .multipliedBy(token1Tvl?.singleAssetTvl || 0)
        .toPrecision();

      const fee =
        fee0USD + fee1USD != 0 ? (fee0USD + fee1USD).toFixed(7) : (fee0USD + fee1USD).toString();

      await this.strategyService.updateFeesWeekly(
        strategyPosition.strategyId,
        strategyPosition.feesWeekly,
        fee,
        tvl
      );
    } catch (error) {
      this.logger.error(error);
    }

    return;
  }

  private async getTokensTvl(strategyPosition: StrategyPosition): Promise<{
    token0Tvl: TokenTvl | undefined;
    token1Tvl: TokenTvl | undefined;
  }> {
    const uniswapV3Client = new UniswapV3Client(strategyPosition.graphqlUrl);
    const tokensTvl = await uniswapV3Client.getTokensTvl([
      strategyPosition.token0Address,
      strategyPosition.token1Address
    ]);

    const token0Tvl = tokensTvl?.find(({ id }) => id === strategyPosition.token0Address);
    const token1Tvl = tokensTvl?.find(({ id }) => id === strategyPosition.token1Address);

    return { token0Tvl, token1Tvl };
  }

  private async getStrategyTvlUSD(
    strategyPosition: StrategyPosition,
    tokensTvl: {
      token0Tvl: TokenTvl | undefined;
      token1Tvl: TokenTvl | undefined;
    }
  ): Promise<number> {
    const cargoServiceContract = RebalancerService.getCargoServiceContract(strategyPosition);

    const amounts = await cargoServiceContract.GUniCurrent(strategyPosition.strategyAddress);
    const amount0 = new BigNumber(amounts._amount0Current.toString());
    const amount1 = new BigNumber(amounts._amount1Current.toString());

    const token0USD = new BigNumber(
      +new BigNumber(amount0.toString()).div(new BigNumber(10).pow(18)).toNumber().toPrecision(4)
    )
      .multipliedBy(tokensTvl.token0Tvl?.singleAssetTvl || 0)
      .toNumber();

    const token1USD = new BigNumber(
      +new BigNumber(amount1.toString()).div(new BigNumber(10).pow(18)).toNumber().toPrecision(4)
    )
      .multipliedBy(tokensTvl.token1Tvl?.singleAssetTvl || 0)
      .toNumber();

    return +(token0USD + token1USD).toFixed(2);
  }
}
