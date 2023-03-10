import StakingProtocolAbi from "@/abis/StakingProtocol.json";
import ContractService from "@/services/contract.service";
import {ContractInterface, providers} from "ethers";
import AggregatorStore from "@/store/aggregator.store";
import BigNumber from "bignumber.js";
import TransactionService from "./transaction.service";
import WalletAuthService from "../wallet-auth.service";
import WalletStore from "@/store/wallet.store";

export default class TransactionCeloService {
  public static async balanceOf(stakingProtocolAddress: string) {
    const stakingProtocolContract = ContractService.getContract(
      StakingProtocolAbi as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      stakingProtocolAddress
    );
    const balanceOf = await stakingProtocolContract.balanceOf();
    return new BigNumber(balanceOf.toString()).div(new BigNumber(10).pow(18)).toNumber();
  }

  public static async getRewardsAmount(stakingProtocolAddress: string) {
    const stakingProtocolContract = ContractService.getContract(
      StakingProtocolAbi as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      stakingProtocolAddress
    );
    const rewardsAmount = await stakingProtocolContract.totalAccumulated();
    return new BigNumber(rewardsAmount.toString()).div(new BigNumber(10).pow(18)).toNumber();
  }

  public static async getRewardRateBPS(stakingProtocolAddress: string): Promise<Number> {
    const stakingProtocolContract = ContractService.getContract(
      StakingProtocolAbi as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      stakingProtocolAddress
    );
    const rewardsAmount = await stakingProtocolContract.rewardRateBPS();
    return new BigNumber(rewardsAmount.toString()).div(new BigNumber(10).pow(2)).toNumber();
  }

  public static async deposit(amount: number, stakingProtocolAddress: string, tokenAddress: string) {
    TransactionService.progress$.next(10);
    TransactionService.stage$.next("Token approval");
    const depositAmount = TransactionService.convertToEherBigNumber(amount);
    const needApproval = await TransactionService.needApprovalForToken(tokenAddress, stakingProtocolAddress, depositAmount);
    if (needApproval) {
      TransactionService.stage$.next("Approval");
      TransactionService.progress$.next(30);
      await TransactionService.approve(tokenAddress, stakingProtocolAddress, 0);
    }
    const stakingProtocolContract = ContractService.getContract(
      StakingProtocolAbi as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      stakingProtocolAddress
    );
    const signer = new providers.Web3Provider(WalletAuthService[WalletStore.currentProvider].provider).getSigner();

    await WalletAuthService[WalletStore.currentProvider].requestAccount();
    TransactionService.walletInfo$.next(TransactionService.walletInfo);
    TransactionService.stage$.next("Authentication");
    TransactionService.progress$.next(50);
    const stakingProtocolContractConnected = stakingProtocolContract.connect(signer);
    const tx = await stakingProtocolContractConnected.deposit(depositAmount.toString());

    TransactionService.walletInfo$.next("");
    TransactionService.stage$.next("Depositing");
    TransactionService.progress$.next(70);
    const interval = setInterval(() => {
      if (TransactionService.progress$.value < 90) {
        TransactionService.progress$.next(TransactionService.progress$.value + 1);
      }
    }, 1000);
    await tx.wait();
    clearInterval(interval);
    TransactionService.progress$.next(100);
    TransactionService.stage$.next("Success");
  }

  public static async withdraw(amount: number, stakingProtocolAddress: string) {
    TransactionService.progress$.next(10);

    const stakingProtocolContract = ContractService.getContract(
      StakingProtocolAbi as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      stakingProtocolAddress
    );
    const signer = new providers.Web3Provider(WalletAuthService[WalletStore.currentProvider].provider).getSigner();

    await WalletAuthService[WalletStore.currentProvider].requestAccount();
    TransactionService.walletInfo$.next(TransactionService.walletInfo);
    TransactionService.stage$.next("Authentication");
    TransactionService.progress$.next(50);

    const withdrawAmount = TransactionService.convertToEherBigNumber(amount);

    const stakingProtocolContractConnected = stakingProtocolContract.connect(signer);
    const tx = await stakingProtocolContractConnected.withdraw(withdrawAmount.toString());

    TransactionService.walletInfo$.next("");
    TransactionService.stage$.next("Withdrawing");
    TransactionService.progress$.next(70);

    const interval = setInterval(() => {
      if (TransactionService.progress$.value < 90) {
        TransactionService.progress$.next(TransactionService.progress$.value + 1);
      }
    }, 1000);
    await tx.wait();
    clearInterval(interval);
    TransactionService.progress$.next(100);
    TransactionService.stage$.next("Success");
  }

  public static async setupRewards(amountPercentage: number, stakingProtocolAddress: string) {
    TransactionService.progress$.next(10);

    const stakingProtocolContract = ContractService.getContract(
      StakingProtocolAbi as ContractInterface,
      AggregatorStore.currentNetwork.networkUrl,
      stakingProtocolAddress
    );
    const signer = new providers.Web3Provider(WalletAuthService[WalletStore.currentProvider].provider).getSigner();

    await WalletAuthService[WalletStore.currentProvider].requestAccount();

    TransactionService.walletInfo$.next(TransactionService.walletInfo);
    TransactionService.stage$.next("Authentication");
    TransactionService.progress$.next(50);

    const stakingProtocolContractConnected = stakingProtocolContract.connect(signer);
    const tx = await stakingProtocolContractConnected.setRewardRateBPS((amountPercentage * 100).toString());

    TransactionService.walletInfo$.next("");
    TransactionService.stage$.next("Updating");
    TransactionService.progress$.next(70);

    const interval = setInterval(() => {
      if (TransactionService.progress$.value < 90) {
        TransactionService.progress$.next(TransactionService.progress$.value + 1);
      }
    }, 1000);
    await tx.wait();
    clearInterval(interval);
    TransactionService.progress$.next(100);
    TransactionService.stage$.next("Success");
  }
}
