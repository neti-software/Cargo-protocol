import { TransportProtocol } from '@components/network/network.entity';

export type TickRange = [number, number];

export interface StrategyPosition {
  strategyId: string;
  networkId: string;
  strategyAddress: string;
  poolAddress: string;
  cargoServiceAddress: string;
  networkUrl: string;
  graphqlUrl: string;
  transportProtocol: TransportProtocol;
  rangePercentage: number;
  lastRangeAdjustTimestamp: Date;
  adjustRangePeriod: string;
  lastReinvestFeesTimestamp: Date;
  reinvestFeesPeriod: string;
  tickSpacing?: number;
  currentTick?: number;
  range?: TickRange;
  newRange?: TickRange;
  stakingProtocolAddress: string | null;
  token0Address: string;
  token1Address: string;
  token0Name: string;
  token1Name: string;
  feesWeekly: string;
  feesAnnual: string;
}

export interface SwapBPSDto {
  swapBPS: number;
  allForOne: boolean;
}

export interface CalculateSwapAmountProps {
  token0Amount: number;
  token1Amount: number;
  currentTick: number;
  tickRange: TickRange;
}

export interface StatusesDetails {
  count: number;
  pools: string[];
}

export interface TokenTvl {
  id: string;
  singleAssetTvl: number;
}

export interface Statuses {
  created?: StatusesDetails;
  error?: StatusesDetails;
  none?: StatusesDetails;
}

export interface NetworkBotStatuses {
  reinvestFeesStatus: Statuses;
  calculateRewardsStatus: Statuses;
}
