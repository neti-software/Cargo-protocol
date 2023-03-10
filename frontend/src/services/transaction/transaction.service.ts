import {BehaviorSubject} from "rxjs";
import erc20Abi from "@/abis/ERC20.json";
import ContractService from "@/services/contract.service";
import {ContractInterface, providers} from "ethers";
import {MaxUint256} from "@/services/constants";
import BigNumber from "bignumber.js";
import WalletStore from "@/store/wallet.store";
import WalletAuthService from "@/services/wallet-auth.service";
import AggregatorStore from "@/store/aggregator.store";

export default class TransactionService {
  public static walletInfo = "Please sign the transaction in your wallet";

  public static progress$ = new BehaviorSubject<number>(0);
  public static stage$ = new BehaviorSubject<string>("");
  public static walletInfo$ = new BehaviorSubject<string>("");

  public static init() {
    TransactionService.progress$.next(0);
    TransactionService.stage$.next("");
  }

  public static async balanceOfToken(tokenAddress: string): Promise<BigNumber> {
    const contract = ContractService.getContract(erc20Abi as ContractInterface, AggregatorStore.currentNetwork.networkUrl, tokenAddress);
    const userBalance = WalletStore.currentAddress ? await contract.balanceOf(WalletStore.currentAddress) : 0;
    return new BigNumber(userBalance.toString());
  }

  public static async needApprovalForToken(tokenAddress: string, contractAddress: string, tokenAmount: BigNumber): Promise<boolean> {
    TransactionService.stage$.next("Checking");
    const tokenContract = ContractService.getContract(
      erc20Abi as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      tokenAddress
    );
    const decimals = await tokenContract.decimals();
    const allowance = await tokenContract.allowance(WalletStore.currentAddress, contractAddress);
    const allowanceAmount = new BigNumber(!allowance ? "0" : allowance.toString())
      .multipliedBy(new BigNumber(10).pow(decimals))
      .decimalPlaces(0);
    return tokenAmount.gt(allowanceAmount);
  }

  public static async approve(tokenAddress: string, contractAddress: string, progress: number = 0) {
    TransactionService.walletInfo$.next(this.walletInfo);
    TransactionService.stage$.next("Approval");
    TransactionService.progress$.next(progress + 10);
    let tokenContract = ContractService.getContract(erc20Abi as ContractInterface, AggregatorStore.currentNetwork.networkUrl, tokenAddress);
    const signer = new providers.Web3Provider(WalletAuthService[WalletStore.currentProvider].provider).getSigner();
    await WalletAuthService[WalletStore.currentProvider].requestAccount();
    TransactionService.progress$.next(progress + 25);
    tokenContract = tokenContract.connect(signer);
    const tx = await tokenContract.approve(contractAddress, MaxUint256);
    TransactionService.walletInfo$.next("");
    return tx.wait();
  }

  public static convertToEherBigNumber(amount: number) {
    return new BigNumber(amount).multipliedBy(new BigNumber(10).pow(18));
  }
}
