import {Contract, ContractInterface} from "ethers";
import CommonStore from "@/store/common.store";

export default class ContractService {
  public static getContract(abi: ContractInterface, network: string | null, address: string | null): Contract {
    if (network != null && address != null) {
      let provider = CommonStore.provider;

      if (Object.entries(provider).length === 0) {
        CommonStore.saveProvider(network);
        provider = CommonStore.provider;
      }

      return new Contract(address, abi, provider);
    } else {
      return new Contract("", abi);
    }
  }
}
