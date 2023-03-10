import { AppErrorCode } from '@constant/errors.constant';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppError } from '@shares/AppError';
import { Between, DeleteResult, MoreThan, Repository, UpdateResult } from 'typeorm';
import { omitBy, isUndefined, isNumber } from 'lodash';
import { Pool } from './pool.entity';

@Injectable()
export class PoolService {
  constructor(
    @InjectRepository(Pool)
    private readonly poolRepository: Repository<Pool>
  ) {}

  async create(pool: Pool): Promise<Pool> {
    const maxOrder = await this.getMaxOrder();
    return await this.poolRepository.save({ ...pool, order: maxOrder + 1 });
  }

  async update(id: string, pool: Pool): Promise<UpdateResult> {
    delete pool.order;
    return this.poolRepository.update(id, pool);
  }

  async updateOrder(id: string, newOrder: number): Promise<UpdateResult> {
    let pool = await this.getById(id);
    if (pool.order === null) {
      await this.setupOrder(pool.networkId);
      pool = await this.getById(id);
    }
    if (newOrder > pool.order) {
      await this.decrementOrderBetween(pool.order, newOrder);
    } else {
      await this.incrementOrderBetween(newOrder, pool.order);
    }
    return this.poolRepository.update(id, { order: newOrder });
  }

  async getPools(filterObj: Partial<Pick<Pool, 'networkId'>>): Promise<Pool[]> {
    return this.poolRepository.find({
      where: {
        ...omitBy(filterObj, isUndefined)
      },
      order: {
        order: 'ASC'
      }
    });
  }

  async getById(poolId: string): Promise<Pool> {
    const pool = await this.poolRepository.findOne({ id: poolId });
    if (!pool) {
      throw new AppError(AppErrorCode.NotFound, `Pool with id='${poolId}' doesn't exist`);
    }
    return pool;
  }

  async delete(poolId: string): Promise<DeleteResult> {
    const poolStrategiesCount = await this.getPoolStrategiesCount(poolId);
    if (poolStrategiesCount > 0) {
      throw new AppError(
        AppErrorCode.Conflict,
        `Cannot remove Pool with id='${poolId}' because it has Strategy references`
      );
    }
    const pool = await this.getById(poolId);
    const deleteResult = await this.poolRepository.delete({ id: poolId });
    if (pool.order) {
      await this.decrementOrderMoreThan(pool.order);
    }
    return deleteResult;
  }

  private async setupOrder(networkId: string): Promise<UpdateResult[]> {
    const allNetworkPools = await this.getPools({
      networkId: networkId
    });
    const updatePromises = allNetworkPools.map((pool, index) =>
      this.poolRepository.update(pool.id, { order: index })
    );
    return Promise.all(updatePromises);
  }

  private async getMaxOrder(): Promise<number> {
    const maxOrderData = await this.poolRepository
      .createQueryBuilder('p')
      .select('MAX(p.order)', 'p')
      .execute();
    return isNumber(maxOrderData[0]?.p) ? maxOrderData[0].p : -1;
  }

  private async incrementOrderBetween(value1: number, value2: number): Promise<UpdateResult> {
    return await this.poolRepository.increment(
      {
        order: Between(value1, value2)
      },
      'order',
      1
    );
  }

  private async decrementOrderBetween(value1: number, value2: number): Promise<UpdateResult> {
    return await this.poolRepository.decrement(
      {
        order: Between(value1, value2)
      },
      'order',
      1
    );
  }

  private async decrementOrderMoreThan(value1: number): Promise<UpdateResult> {
    return await this.poolRepository.decrement(
      {
        order: MoreThan(value1)
      },
      'order',
      1
    );
  }

  private async getPoolStrategiesCount(poolId: string): Promise<number> {
    const hasPoolReferencesQuery = await this.poolRepository
      .createQueryBuilder('p')
      .innerJoinAndMapMany('p.strategies', 'strategy', 's', 'p.id = s.poolId')
      .select('count(s.id) strategiesCount')
      .where({ id: poolId })
      .execute();
    return hasPoolReferencesQuery[0].strategiesCount;
  }
}
