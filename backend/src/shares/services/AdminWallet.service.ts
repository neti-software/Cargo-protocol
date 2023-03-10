import { BigNumber, Contract, providers, Wallet } from 'ethers';
import { TransportProtocol } from '@components/network/network.entity';
import config from '@/config';

export class AdminWallet {
  private readonly adminWallet: Wallet;
  private readonly provider: providers.WebSocketProvider | providers.JsonRpcProvider;

  constructor(chainUrl: string, transportProtocol: TransportProtocol) {
    if (transportProtocol === TransportProtocol.HTTPS) {
      this.provider = new providers.JsonRpcProvider(chainUrl);
    } else {
      this.provider = new providers.WebSocketProvider(chainUrl);
    }

    const wallet = new Wallet(config.rebalancer.botPrivateKey);

    this.adminWallet = wallet.connect(this.provider);

    const originalBlockFormatter = this.provider.formatter._block;
    this.provider.formatter._block = (value, format) => {
      return originalBlockFormatter(
        {
          gasLimit: 0,
          ...value
        },
        format
      );
    };
  }

  contract(address: string, abi: string): Contract {
    return new Contract(address, abi, this.adminWallet);
  }

  getGasPrice(): Promise<BigNumber> {
    return this.provider.getGasPrice();
  }
}
