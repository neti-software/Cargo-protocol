export interface Strategy {
  id?: string;
  poolId: string;
  address: string;
  name: string;
  rangePercentage: number | null;
  myTVL?: string;
  token0Address?: string;
  token0Amount?: number;
  token0USD?: number;
  token1Address?: string;
  token1USD?: number;
  token1Amount?: number;
  liquidity?: number;
  apy?: string | null;
  feesWeekly?: string | null;
  totalFeesWeekly?: number | null;
  apyFromFeesWeekly?: string | null;
  feesAnnual?: string | null;
  totalFeesAnnual?: number | null;
  apyFromFeesAnnual?: string | null;
  apyAnnual?: string | null;
  executionPeriod: string;
  stakingProtocolAddress?: string | null;
}
