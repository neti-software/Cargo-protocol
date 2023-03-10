import detectEthereumProvider from '@metamask/detect-provider'
import Vue from 'vue';
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from 'walletlink';
import Web3 from 'web3';
import {ExternalProvider} from "@ethersproject/providers";
import {Ethereum, NetworkEnum, WalletEnum} from "@/interfaces";
import CommonStore from "@/store/common.store";
import WalletStore from "@/store/wallet.store";

interface IWalletMethods {
    connect: () => Promise<string>;
    disconnect: () => Promise<void>;
    requestAccount: () => Promise<string>;
    network: NetworkEnum,
    provider: ExternalProvider
}

const noop: IWalletMethods = {
    connect: async (): Promise<string> => {
        return new Promise<string>(resolve => {
            resolve('');
        })
    },
    disconnect: async (): Promise<void> => {
        return new Promise<void>(resolve => {
            resolve();
        })
    },
    requestAccount: async (): Promise<string> => {
        return new Promise<string>(resolve => {
            resolve('');
        })
    },
    get network(): NetworkEnum {
        return NetworkEnum.Main
    },
    set network(network: NetworkEnum) {

    },

    get provider() {
        return '' as any;
    }
}

export default class WalletAuthService {

    private static walletConnectProvider?: WalletConnectProvider;
    private static metaMaskProvider?: Ethereum;
    private static coinBaseProvider?: Ethereum;

    public static readonly [WalletEnum.metamask]: IWalletMethods = {
        connect: async (): Promise<string> => {
            const provider = await detectEthereumProvider({mustBeMetaMask: true});
            if (provider) {
                WalletAuthService.metaMaskProvider = provider as Ethereum;
                const accounts = await (provider as Ethereum).request({method: 'eth_requestAccounts'});
                return accounts[0];
            } else {
                Vue.$toast.error('Unable to find MetaMask');
                return new Promise<string>(resolve => {
                    resolve('');
                })
            }
        },
        requestAccount: async(): Promise<string> => {
            if (WalletAuthService.metaMaskProvider) {
                const accounts = await (WalletAuthService.metaMaskProvider).request({method: 'eth_requestAccounts'});
                return accounts[0];
            }
            return '';
        },
        get network(): NetworkEnum {
            const Ethereum = window.ethereum as Ethereum;
            return Ethereum.networkVersion as NetworkEnum;
        },
        set network(network: NetworkEnum) {
            try {
                CommonStore.startLoading();
                const Ethereum = window.ethereum as Ethereum;
                const chainId = `0x${network.toString(16)}`;
                Ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{chainId}]
                });
            } catch (switchError) {
                CommonStore.stopLoading();
                Vue.$toast.error(switchError.message);
            }
        },
        get provider() {
            return WalletAuthService.metaMaskProvider as ExternalProvider;
        },
        disconnect: async(): Promise<void> => {
            CommonStore.startLoading();
            WalletStore.destroyWallet();
            CommonStore.stopLoading();
        }
    }

    public static readonly [WalletEnum.walletConnect]: IWalletMethods = {
        connect: async (): Promise<string> => {
            const provider = new WalletConnectProvider({
                infuraId: 'b7b5cca41103499999cc8277e68c081d',
                rpc: {
                    1: 'https://mainnet.infura.io/v3/07e180fc271d4e79a8a9fb1001f57a6b',
                    56: 'https://bsc-dataseed.binance.org',
                    137: 'https://rpc-mainnet.maticvigil.com',
                    42220: 'https://rpc.ankr.com/celo/'
                },
                qrcodeModalOptions: {
                    mobileLinks: [
                      "valora",
                      "metamask"
                    ],
                  },
            });
            const accounts = await provider.enable();

            WalletAuthService.walletConnectProvider = provider;
            CommonStore.stopLoading();


            return accounts[0] || '';
        },
        requestAccount: async(): Promise<string> => {
            if (WalletAuthService.walletConnectProvider) {
                const accounts = WalletAuthService.walletConnectProvider.accounts
                return accounts[0];
            }
            return '';
        },
        disconnect: async (): Promise<void> => {
            CommonStore.startLoading();
            WalletStore.destroyWallet();
            await WalletAuthService.walletConnectProvider!.disconnect();
            WalletAuthService.walletConnectProvider = undefined;
            CommonStore.stopLoading();
        },
        get network(): NetworkEnum {
            return NetworkEnum.Main;
        },
        set network(network: NetworkEnum) {
        },
        get provider() {
            return WalletAuthService.walletConnectProvider as ExternalProvider;
        },
    }

    public static readonly [WalletEnum.coinbase]: IWalletMethods = {
        connect: async (): Promise<string> => {
            const provider = new WalletLink({
                appName: "layer.exchange",
                darkMode: false
            });
            const ethereum = provider.makeWeb3Provider("https://mainnet.infura.io/v3/07e180fc271d4e79a8a9fb1001f57a6b", 43113)

            const web3 = new Web3(ethereum as any);
            const accounts = (await ethereum.request({method: 'eth_requestAccounts'})) as string[];
            ethereum.enable().then((accounts: string[]) => {
                web3.eth.defaultAccount = accounts[0]
            })

            WalletAuthService.coinBaseProvider = ethereum as any;
            return accounts[0] || '';
        },
        requestAccount: async(): Promise<string> => {
            if (WalletAuthService.coinBaseProvider) {
                const accounts = (await WalletAuthService.coinBaseProvider.request({method: 'eth_requestAccounts'})) as string[];
                return accounts[0];
            }
            return '';
        },
        disconnect: async (): Promise<void> => {
          CommonStore.startLoading();
          WalletStore.destroyWallet();
          CommonStore.stopLoading();
        },
        get network(): NetworkEnum {
          return NetworkEnum.Main;
        },
        set network(network: NetworkEnum) {
        },
        get provider() {
            return WalletAuthService.coinBaseProvider! as ExternalProvider;
        },
    };

    public static readonly [WalletEnum.none]: IWalletMethods = noop
}
