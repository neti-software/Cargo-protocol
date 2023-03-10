export interface GraphqlData {
  query: string;
  variables?: Record<string, unknown>;
}

export interface PoolWithTotalValueLocked {
  totalValueLockedUSD: string;
  id: string;
}

export interface TokenTvl {
  id: string;
  singleAssetTvl: number;
}
