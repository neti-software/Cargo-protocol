import axios, { AxiosInstance } from 'axios';

export interface UniswapV3Position {
  id?: string;
  tick?: string;
  feeTier?: FeeTier;
}

export enum FeeTier {
  tier100 = '100',
  tier500 = '500',
  tier3000 = '3000',
  tier10000 = '10000'
}

export interface TokenTvl {
  id: string;
  singleAssetTvl: number;
}

export class UniswapV3Client {
  private readonly axiosUniswapClient: AxiosInstance;
  constructor(baseURL: string) {
    this.axiosUniswapClient = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getPoolsData(addresses: string[]): Promise<UniswapV3Position[]> {
    try {
      const positionsResponse = await this.axiosUniswapClient.post('', {
        query: `
          query($id_in: [ID!] = []) {
            pools(where: {id_in: $id_in}) {
              id
              tick
              feeTier
            }
          }`,
        variables: {
          id_in: addresses
        }
      });

      return positionsResponse.data.data.pools;
    } catch (e) {
      switch (e.response.status) {
        case 404:
          return [];
        default:
          throw e;
      }
    }
  }

  async getTokensTvl(addresses: string[]): Promise<TokenTvl[]> {
    const tokensData = await this.axiosUniswapClient.post('', {
      query: `query MyQuery($id_in: [ID!] = []) {
        tokens(where: {id_in: $id_in}) {
          id
          totalValueLockedUSD
          totalValueLocked
        }
      }`,
      variables: {
        id_in: addresses
      }
    });

    return (
      tokensData.data.data.tokens.map(({ id, totalValueLocked, totalValueLockedUSD }) => ({
        id,
        singleAssetTvl: +(+totalValueLockedUSD / +totalValueLocked).toPrecision(2)
      })) || []
    );
  }
}
