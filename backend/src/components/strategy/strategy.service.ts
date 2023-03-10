import { AppErrorCode } from '@constant/errors.constant';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppError } from '@shares/AppError';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { GetStrategiesDto, StrategyWithPoolDto } from './strategy.dto';
import { Strategy } from './strategy.entity';
import * as Moment from 'moment';

@Injectable()
export class StrategyService {
  private readonly FEES_WEEKLY_MAX_LENGTH: number = 28;
  private readonly FEES_ANNUAL_MAX_LENGTH: number = 365;

  constructor(
    @InjectRepository(Strategy)
    private readonly strategyRepository: Repository<Strategy>
  ) {}

  async create(strategy: Strategy): Promise<Strategy> {
    const mappedStrategy = this.getMappedStrategy(strategy);
    return await this.strategyRepository.save(mappedStrategy);
  }

  async update(id: string, strategy: Strategy): Promise<UpdateResult> {
    const mappedStrategy = this.getMappedStrategy(strategy);

    return this.strategyRepository.update(id, mappedStrategy);
  }

  async updateLastExecutionDate(strategyIds: string[] | string): Promise<UpdateResult> {
    return this.strategyRepository.update(strategyIds, {
      lastExecutionTimestamp: new Date()
    });
  }

  async getStrategies({ networkId, poolId }: GetStrategiesDto): Promise<Strategy[]> {
    const query = this.strategyRepository.createQueryBuilder('s');

    if (networkId) {
      query.innerJoin('s.pool', 'p').innerJoin('p.network', 'n').where('n.id = :networkId', {
        networkId
      });
    }

    if (poolId) {
      query.where('s.poolId = :poolId', { poolId });
    }

    return await query.getMany();
  }

  async getStrategiesWithPoolAndNetwork(): Promise<StrategyWithPoolDto[]> {
    const query = this.strategyRepository.createQueryBuilder('s');

    query.innerJoinAndSelect('s.pool', 'pool').where('s.poolId = pool.id');
    query.innerJoinAndSelect('pool.network', 'network').where('pool.networkId = network.id');

    return await query.getMany();
  }

  async getById(strategyId: string): Promise<Strategy> {
    const strategy = await this.strategyRepository.findOne({
      id: strategyId
    });
    if (!strategy) {
      throw new AppError(AppErrorCode.NotFound, `Strategy with id='${strategyId}' doesn't exist`);
    }
    return strategy;
  }

  async delete(strategyId: string): Promise<DeleteResult> {
    return this.strategyRepository.delete({
      id: strategyId
    });
  }

  private getMappedStrategy(strategy: Strategy): Strategy {
    return {
      ...strategy,
      stakingProtocolAddress: strategy.stakingProtocolAddress
        ? strategy.stakingProtocolAddress.toLowerCase()
        : null,
      address: strategy.address.toLowerCase()
    };
  }

  async updateFeesWeekly(
    id: string,
    currentFeeArray: string,
    newFee: string,
    tvl: number
  ): Promise<UpdateResult> {
    const feesWeekly = await this.prepareFeeWeeklyArray(id, currentFeeArray, newFee, tvl);

    const totalFeesWeekly = +(await this.getById(id)).totalFeesWeekly;
    let updatedTotalFeesWeekly = 0;
    if (!totalFeesWeekly) {
      updatedTotalFeesWeekly = +newFee / tvl;
    } else {
      updatedTotalFeesWeekly = totalFeesWeekly + +newFee / tvl;
    }

    return this.strategyRepository.update(id, {
      feesWeekly,
      totalFeesWeekly: updatedTotalFeesWeekly.toFixed(7)
    });
  }

  private async prepareFeeWeeklyArray(
    id: string,
    currentFeeArray: string,
    fee: string,
    tvl: number
  ): Promise<string> {
    let feeWeeklyArray = [];

    if (currentFeeArray === null || currentFeeArray === '') {
      feeWeeklyArray.push(
        JSON.stringify({
          fee,
          tvl,
          date: new Date()
        })
      );
    } else {
      feeWeeklyArray = currentFeeArray.replace(/},{/g, '}|{').split('|');

      if (feeWeeklyArray.length >= this.FEES_WEEKLY_MAX_LENGTH) {
        const poppedFee = feeWeeklyArray.pop();

        const totalFeesWeekly = +(await this.getById(id)).totalFeesWeekly;
        if (totalFeesWeekly) {
          const poppedFeeParsed = JSON.parse(poppedFee);
          const calculatedLastFee = +(+poppedFeeParsed.fee / poppedFeeParsed.tvl).toFixed(7);
          const updatedTotalFeesWeekly = totalFeesWeekly - calculatedLastFee;

          await this.strategyRepository.update(id, {
            totalFeesWeekly: updatedTotalFeesWeekly.toFixed(7)
          });
        }
      }

      feeWeeklyArray.unshift(
        JSON.stringify({
          fee,
          tvl,
          date: new Date()
        })
      );
    }

    return feeWeeklyArray.toString();
  }

  async updateFeesAnnual(id: string): Promise<UpdateResult> {
    const strategy = await this.getById(id);

    if (strategy.feesWeekly) {
      const strategyFeesWeekly = (strategy.feesWeekly as string)
        .replace(/},{/g, '}|{')
        .split('|')
        .map((x: string | { fee: number; tvl: number; date: string }) => {
          x = JSON.parse(x as string);
          const y = x as { fee: number; tvl: number; date: string };
          y.fee = +y.fee;
          y.tvl = +y.tvl;
          return y;
        });

      const yesterdayStartDay = Moment(new Date()).add(-1, 'days').startOf('day');
      const yesterdayEndDay = Moment(new Date()).add(-1, 'days').endOf('day');

      const yesterdayFee = strategyFeesWeekly.reduce(
        (result, currentValue) => {
          const { date, fee } = currentValue;

          if (Moment(date).isBetween(yesterdayStartDay, yesterdayEndDay)) {
            const formatDate = Moment(date).format('YYYY-MM-DD');
            if (!result.date) {
              result = {
                ...result,
                date: formatDate
              };
            }

            if (result.date === formatDate) {
              result.fee += fee;
            }
          }

          return result;
        },
        {
          date: null,
          fee: 0
        }
      );

      const yesterdayTvl = strategyFeesWeekly.reduce(
        (result, currentValue) => {
          const { date, tvl } = currentValue;

          if (Moment(date).isBetween(yesterdayStartDay, yesterdayEndDay)) {
            const formatDate = Moment(date).format('YYYY-MM-DD');
            if (!result.date) {
              result = {
                ...result,
                date: formatDate
              };
            }

            if (result.date === formatDate) {
              result.tvl += tvl;
              result.length++;
            }
          }

          return result;
        },
        {
          date: null,
          tvl: 0,
          length: 0
        }
      );

      const yesterdayTvlAverage = +(yesterdayTvl.tvl / yesterdayTvl.length).toFixed(2);

      if (yesterdayFee.date) {
        const feesAnnualArray = await this.prepareFeeAnnualArray(
          id,
          strategy.feesAnnual,
          yesterdayFee.date,
          yesterdayFee.fee.toFixed(7),
          yesterdayTvlAverage
        );

        const totalFeesAnnual = +(await this.getById(id)).totalFeesAnnual;
        let updatedTotalFeesAnnual = 0;
        if (!totalFeesAnnual) {
          updatedTotalFeesAnnual = +yesterdayFee.fee.toFixed(7) / yesterdayTvlAverage;
        } else {
          updatedTotalFeesAnnual =
            totalFeesAnnual + +yesterdayFee.fee.toFixed(7) / yesterdayTvlAverage;
        }

        return this.strategyRepository.update(id, {
          feesAnnual: feesAnnualArray,
          totalFeesAnnual: updatedTotalFeesAnnual.toFixed(7)
        });
      }
    }

    return;
  }

  private async prepareFeeAnnualArray(
    id: string,
    currentFeeArray: string,
    date: string,
    fee: string,
    tvl: number
  ): Promise<string> {
    let feeAnnualArray = [];

    if (currentFeeArray === null || currentFeeArray === '') {
      feeAnnualArray.push(
        JSON.stringify({
          fee,
          tvl,
          date
        })
      );
    } else {
      feeAnnualArray = currentFeeArray.replace(/},{/g, '}|{').split('|');

      if (feeAnnualArray.length >= this.FEES_ANNUAL_MAX_LENGTH) {
        const poppedFee = feeAnnualArray.pop();

        const totalFeesAnnual = +(await this.getById(id)).totalFeesAnnual;
        if (totalFeesAnnual) {
          const poppedFeeParsed = JSON.parse(poppedFee);
          const calculatedLastFee = +(+poppedFeeParsed.fee / poppedFeeParsed.tvl).toFixed(7);
          const updatedTotalFeesAnnual = totalFeesAnnual - calculatedLastFee;

          await this.strategyRepository.update(id, {
            totalFeesAnnual: updatedTotalFeesAnnual.toFixed(7)
          });
        }
      }

      feeAnnualArray.unshift(
        JSON.stringify({
          fee,
          tvl,
          date
        })
      );
    }

    return feeAnnualArray.toString();
  }

  async calculateApyFromYesterday(id: string): Promise<UpdateResult> {
    const strategy = await this.getById(id);

    const feesAnnualLength = (strategy.feesAnnual as string)
      .replace(/},{/g, '}|{')
      .split('|').length;

    const apyFromFeesAnnual = `${(
      +strategy.totalFeesAnnual *
      100 *
      (365 / feesAnnualLength)
    ).toFixed(2)}`;

    const yesterdayDate = Moment(new Date()).add(-1, 'days').format('YYYY-MM-DD');

    const apyAnnualArray = this.prepareApyAnnualArray(
      strategy.apyAnnual,
      yesterdayDate,
      apyFromFeesAnnual
    );

    return this.strategyRepository.update(id, {
      apyAnnual: apyAnnualArray
    });
  }

  private prepareApyAnnualArray(currentApyArray: string, date: string, apy: string): string {
    let apyAnnualArray = [];

    if (currentApyArray === null || currentApyArray === '') {
      apyAnnualArray.push(
        JSON.stringify({
          apy,
          date
        })
      );
    } else {
      apyAnnualArray = currentApyArray.replace(/},{/g, '}|{').split('|');

      if (apyAnnualArray.length >= this.FEES_ANNUAL_MAX_LENGTH) {
        apyAnnualArray.pop();
      }

      apyAnnualArray.unshift(
        JSON.stringify({
          apy,
          date
        })
      );
    }

    return apyAnnualArray.toString();
  }
}
