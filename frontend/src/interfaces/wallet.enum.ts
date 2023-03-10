export enum WalletEnum {
    none,
    metamask,
    coinbase,
    walletConnect
}

export const colorMap = {
    [WalletEnum.none]: '#CC3366',
    [WalletEnum.metamask]: '#F6851B',
    [WalletEnum.coinbase]: '#3259A5',
    [WalletEnum.walletConnect]: '#3B99FC',
}
