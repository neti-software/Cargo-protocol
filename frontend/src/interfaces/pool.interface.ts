export interface Pool {
  id?: string;
  networkId: string;
  token0Name: string;
  token0Address: string;
  token0Amount?: number;
  token1Name: string;
  token1Address: string;
  token1Amount?: number;
  fee: number | null;
  uniswapPoolAddress: string;
  isActive?: boolean;
  myTVL?: string;
  TVL?: string;
  APY?: number;
  order?: number;
}
