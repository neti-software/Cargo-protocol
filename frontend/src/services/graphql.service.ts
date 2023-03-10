import axios from "axios";
import Vue from "vue";
import AggregatorStore from "@/store/aggregator.store";
import {GraphqlData, PoolWithTotalValueLocked, TokenTvl} from "@/interfaces";

export class GraphqlService {
  graphqlUrl: string;

  constructor(graphqlUrl: string) {
    this.graphqlUrl = graphqlUrl;
  }

  public post<T>(data: GraphqlData): Promise<null | T> {
    return axios
      .post(this.graphqlUrl, data)
      .then((res) => res.data.data as T)
      .catch((error) => this.handleError(error));
  }

  private handleError<T>(response: any) {
    if (response && response.message) {
      Vue.$toast.error(response.message);
    }
    return null;
  }
}

export class GraphqlQueriesService {
  private static graphqlService: GraphqlService;

  public static async init() {
    this.graphqlService = new GraphqlService(AggregatorStore.currentNetwork.graphqlUrl);
  }

  public static async getPoolsTvl(poolAddreses: string[]): Promise<PoolWithTotalValueLocked[]> {
    const poolTvls = await this.graphqlService.post<{pools: []}>({
      query: `query MyQuery($id_in: [ID!] = []) {
                    pools(where: {id_in: $id_in}) {
                      totalValueLockedUSD
                      id
                    }
                  }`,
      variables: {
        id_in: poolAddreses
      }
    });
    return poolTvls?.pools || [];
  }

  public static async getTokensTvl(addreses: string[]): Promise<TokenTvl[]> {
    const tokensData = (
      await this.graphqlService.post<{tokens: {id: string; totalValueLockedUSD: string; totalValueLocked: string}[]}>({
        query: `query MyQuery($id_in: [ID!] = []) {
                      tokens(where: {id_in: $id_in}) {
                        id
                        totalValueLockedUSD
                        totalValueLocked
                      }
                    }`,
        variables: {
          id_in: addreses
        }
      })
    )?.tokens;

    return (
      tokensData?.map(({id, totalValueLocked, totalValueLockedUSD}) => ({
        id,
        singleAssetTvl: +(+totalValueLockedUSD / +totalValueLocked).toPrecision(2)
      })) || []
    );
  }
}
