import { Network } from '@components/network/network.entity';
import { Pool } from '@components/pool/pool.entity';
import { Strategy } from './strategy.entity';

export interface GetStrategiesDto {
  poolId?: string;
  networkId?: string;
}

export type StrategyWithPoolDto = Strategy & {
  pool: Pool & { network: Network };
};
