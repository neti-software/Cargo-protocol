export interface Network {
  id?: string;
  name: string;
  platform: string;
  networkUrl: string;
  rpcUrl: string;
  chainId: number | null;
  transportProtocol: string;
  cargoServiceAddress: string;
  graphqlUrl: string;
  isActive: boolean;
  executionPeriod?: string;
}
