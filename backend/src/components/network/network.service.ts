import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppError } from '@shares/AppError';
import { DeleteResult, Not, Repository, UpdateResult } from 'typeorm';
import { Network } from './network.entity';
import { AppErrorCode } from '@constant/errors.constant';

@Injectable()
export class NetworkService {
  constructor(
    @InjectRepository(Network)
    private readonly networkRepository: Repository<Network>
  ) {}

  async create(network: Network): Promise<Network> {
    return this.networkRepository.save(network);
  }

  async update(id: string, newNetwork: Network): Promise<UpdateResult> {
    const network = await this.getById(id);
    if (network.isActive && !newNetwork.isActive) {
      throw new AppError(
        AppErrorCode.Conflict,
        `Cannot deactivate the only active Network with id='${id}'`
      );
    }
    const updateResult = await this.networkRepository.update(id, newNetwork);
    if (newNetwork.isActive) {
      await this.networkRepository.update({ id: Not(id) }, { isActive: false });
    }
    return updateResult;
  }

  async updateLastExecutionDate(networkIds: string[] | string): Promise<UpdateResult> {
    return this.networkRepository.update(networkIds, {
      lastExecutionTimestamp: new Date()
    });
  }

  async getNetworks(): Promise<Network[]> {
    return this.networkRepository.find();
  }

  async getActive(): Promise<Network> {
    const network = await this.networkRepository.findOne({ isActive: true });
    if (!network) {
      throw new AppError(AppErrorCode.NotFound, `Active network doesn't exist`);
    }
    return network;
  }

  async getById(networkId: string): Promise<Network> {
    const network = await this.networkRepository.findOne({ id: networkId });
    if (!network) {
      throw new AppError(AppErrorCode.NotFound, `Network with id='${networkId}' doesn't exist`);
    }
    return network;
  }

  async delete(networkId: string): Promise<DeleteResult> {
    const network = await this.getById(networkId);
    if (network.isActive) {
      throw new AppError(
        AppErrorCode.Conflict,
        `Cannot remove Network with id='${networkId}' because it is an active one`
      );
    }

    const networkPoolsCount = await this.getNetworkPoolsCount(networkId);
    if (networkPoolsCount > 0) {
      throw new AppError(
        AppErrorCode.Conflict,
        `Cannot remove Network with id='${networkId}' because it has Pool references`
      );
    }

    return await this.networkRepository.delete({ id: networkId });
  }

  private async getNetworkPoolsCount(networkId: string): Promise<number> {
    const hasPoolReferencesQuery = await this.networkRepository
      .createQueryBuilder('n')
      .innerJoinAndMapMany('n.pools', 'pool', 'p', 'n.id = p.networkId')
      .select('count(p.id) poolsCount')
      .where({ id: networkId })
      .execute();
    return hasPoolReferencesQuery[0].poolsCount;
  }
}
