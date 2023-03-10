export enum NetworkEnum {
  Main = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 5,
  Kovan = 42,
  Polygon = 137,
  Avalanche = 43114,
  Celo = 42220,
  Alfarojes = 44787
}

export const networkObjectMap = {
  [NetworkEnum.Main]: {
    id: NetworkEnum.Main,
    name: "Ethereum Mainnet"
  },
  [NetworkEnum.Rinkeby]: {
    id: NetworkEnum.Rinkeby,
    name: "Rinkeby Testnet"
  },
  [NetworkEnum.Ropsten]: {
    id: NetworkEnum.Ropsten,
    name: "Ropsten Testnet"
  },
  [NetworkEnum.Goerli]: {
    id: NetworkEnum.Goerli,
    name: "Goerli Testnet"
  },
  [NetworkEnum.Kovan]: {
    id: NetworkEnum.Kovan,
    name: "Kovan Testnet"
  },
  [NetworkEnum.Polygon]: {
    id: NetworkEnum.Polygon,
    name: "Polygon Mainnet"
  },
  [NetworkEnum.Avalanche]: {
    id: NetworkEnum.Avalanche,
    name: "Avalanche Mainnet"
  },
  [NetworkEnum.Celo]: {
    id: NetworkEnum.Celo,
    name: "Celo Mainnet"
  },
  [NetworkEnum.Alfarojes]: {
    id: NetworkEnum.Alfarojes,
    name: "Celo Alfarojes Testnet"
  }
};
