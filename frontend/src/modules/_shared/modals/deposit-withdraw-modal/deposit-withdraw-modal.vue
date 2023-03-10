<template>
  <modal-wrapper
    :height="1000"
    :center="true"
    :full-width="isMobile"
    :back-drop-close="true"
    :escape-close="true"
    :max-width="1080"
    @backdrop-click="closeClick"
    @escape-click="closeClick"
  >
    <v-card class="manage-modal" rounded outlined elevation="10">
      <v-card-title class="manage-modal__header">Manage Pool {{ pool.token0Name }}/{{ pool.token1Name }}</v-card-title>
      <div v-if="step === 0">
        <v-card class="fancy-card" elevation="0" rounded outlined :disabled="isCheckingBalances">
          <v-card-title class="manage-modal--medium-font">Deposit</v-card-title>
          <v-slider
            v-model="depositPercentage"
            :color="colorSlider('token0')"
            hide-details
            :disabled="(bigNumberToNumber(token0Max) === 0 || bigNumberToNumber(token1Max) === 0) && !isCheckingBalances"
            track-color="grey"
            always-dirty
            thumb-label
            :min="0"
            :max="100"
          >
            <template v-slot:thumb-label="{value}"> {{ value }}% </template>
          </v-slider>
          <div v-if="!isCheckingBalances">
            <div v-if="bigNumberToNumber(token0Max) === 0 || bigNumberToNumber(token1Max) === 0">
              <p class="manage-modal--light-font">You don't have enough tokens to deposit</p>
            </div>

            <div v-else>
              <div v-if="depositPercentage > 0">
                <p class="manage-modal--light-font">{{ pool.token0Name }}: {{ bigNumberToNumber(token0Value) }}</p>
                <p class="manage-modal--light-font">{{ pool.token1Name }}: {{ bigNumberToNumber(token1Value) }}</p>
              </div>
              <p class="manage-modal--light-font" v-if="depositPercentage === 0">If you want to deposit tokens, select the amount</p>
            </div>
          </div>
        </v-card>
        <v-card class="fancy-card" elevation="0" rounded outlined :disabled="isCheckingBalances">
          <v-card-title class="manage-modal--medium-font">Withdraw</v-card-title>
          <v-slider
            v-model="withdrawPercentage"
            :disabled="bigNumberToNumber(liquidityToWithdraw) === 0 && !isCheckingBalances"
            :color="colorSlider('token1')"
            hide-details
            track-color="grey"
            always-dirty
            thumb-label
            :min="0"
            :max="100"
          >
            <template v-slot:thumb-label="{value}"> {{ value }}% </template>
          </v-slider>

          <div v-if="!isCheckingBalances">
            <div v-if="bigNumberToNumber(token0AmountToWithdraw) === 0">
              <p class="manage-modal--light-font">You don't have liquidity to withdraw</p>
            </div>

            <div v-else>
              <div v-if="withdrawPercentage > 0">
                <p class="manage-modal--light-font">
                  {{ pool.token0Name }}: {{ ((bigNumberToNumber(token0AmountToWithdraw) * withdrawPercentage) / 100).toPrecision(3) }}
                  {{ pool.token0Name }}
                </p>
                <p class="manage-modal--light-font">
                  {{ pool.token1Name }}: {{ ((bigNumberToNumber(token1AmountToWithdraw) * withdrawPercentage) / 100).toPrecision(3) }}
                  {{ pool.token1Name }}
                </p>
              </div>
              <p class="manage-modal--light-font" v-if="withdrawPercentage === 0">If you want to withdraw tokens, select the amount</p>
            </div>
          </div>
        </v-card>
        <div class="manage-modal__card-actions">
          <v-btn outlined large elevation="0" :disabled="confirmLoading" @click="closeClick">Cancel</v-btn>
          <v-btn
            color="primary"
            elevation="0"
            large
            :loading="confirmLoading"
            :disabled="depositPercentage === 0 && withdrawPercentage === 0"
            @click="step = 1"
            class="ml-4"
            >Next
          </v-btn>
        </div>
      </div>
      <div v-if="step === 1">
        <v-card class="fancy-card" rounded outlined elevation="0" v-if="depositPercentage > 0">
          <p class="manage-modal--light-font text-center">Deposit summary</p>
          <data-row :name="pool.token0Name" :data="bigNumberToNumber(token0Value)" />
          <data-row :name="pool.token1Name" :data="bigNumberToNumber(token1Value)" />
          <data-row name="Strategy" :data="strategy.name" :type="riskColor" />
        </v-card>
        <v-card class="fancy-card" rounded outlined elevation="0" v-else>
          <p class="manage-modal--light-font text-center">Withdraw summary</p>
          <data-row
            :name="pool.token0Name"
            :data="((bigNumberToNumber(token0AmountToWithdraw) * withdrawPercentage) / 100).toPrecision(3)"
          />
          <data-row
            :name="pool.token1Name"
            :data="((bigNumberToNumber(token1AmountToWithdraw) * withdrawPercentage) / 100).toPrecision(3)"
          />
          <data-row name="Liquidity" :data="((bigNumberToNumber(liquidityToWithdraw) * withdrawPercentage) / 100).toPrecision(3)" />
        </v-card>
        <div class="manage-modal__card-actions">
          <v-btn outlined large elevation="0" @click="step = 0">Back</v-btn>
          <v-btn color="primary" elevation="0" large :loading="loading" @click="confirmDeposit" v-if="depositPercentage > 0"
            >Supply liquidity</v-btn
          >
          <v-btn color="primary" elevation="0" large :loading="loading" @click="confirmWithdraw" v-else>Withdraw liquidity</v-btn>
        </div>
      </div>
      <div v-if="step === 2">
        <div class="manage-modal__card-loader">
          <p class="manage-modal--light-font">{{ walletInfo }}</p>
          <p>{{ stage }}</p>
          <v-progress-linear color="primary" :value="progressValue" height="10" rounded striped></v-progress-linear>
        </div>
        <div class="manage-modal__card-actions">
          <v-btn outlined large elevation="0" :disabled="step === 2">Back</v-btn>
          <v-btn color="primary" elevation="0" large :loading="loading" disabled v-if="depositPercentage > 0">Supply liquidity</v-btn>
          <v-btn color="primary" elevation="0" large :loading="loading" disabled v-else>Withdraw liquidity</v-btn>
        </div>
      </div>
    </v-card>
  </modal-wrapper>
</template>
<script lang="ts">
import {Component, Prop, Watch} from "vue-property-decorator";
import ModalWrapper from "@/modules/_shared/modals/modal-wrapper/modal-wrapper.vue";
import {mixins} from "vue-class-component";
import ModalMixin from "@/modules/_shared/modals/modal-mixin.vue";
import {Pool, Strategy} from "@/interfaces";
import TransactionService from "@/services/transaction/transaction.service";
import TransactionUniswapService from "@/services/transaction/transaction-uniswap.service";
import {combineLatest} from "rxjs";
import {Subject} from "rxjs-compat";
import {takeUntil} from "rxjs/operators";
import DataRow from "@/modules/_shared/common/data-row/data-row.vue";
import UniswapV3Service from "@/services/uniswapV3.service";
import CommonStore from "@/store/common.store";
import BigNumber from "bignumber.js";
import AssetsStore from "@/store/assets.store";
import AggregatorStore from "@/store/aggregator.store";

@Component({
  components: {DataRow, ModalWrapper}
})
export default class DepositWithdrawModal extends mixins(ModalMixin) {
  @Prop({required: true}) pool!: Pool;
  @Prop({required: true}) strategy!: Strategy;

  private readonly destroy$ = new Subject();
  private loading: boolean = false;
  private progressValue: number = 0;
  private stage: string = "";
  private walletInfo: string = "";
  private readonly TOKEN_DECIMAL_PLACES_18: number = 18;
  private readonly TOKEN_DECIMAL_PLACES_6: number = 6;

  public fetchTokensDataInterval: ReturnType<typeof setInterval> | undefined = undefined;
  public depositPercentage: number = 0;
  public withdrawPercentage: number = 0;
  public tokensMaxLiquidity: BigNumber = new BigNumber(0);
  public token0CurrentLiquidity: BigNumber = new BigNumber(0);
  public token1CurrentLiquidity: BigNumber = new BigNumber(0);
  public totalSupply: BigNumber = new BigNumber(0);
  public token1Price: number = 0;
  public token0Value: BigNumber = new BigNumber(0);
  public token1Value: BigNumber = new BigNumber(0);
  public token0Max: BigNumber = new BigNumber(0);
  public token1Max: BigNumber = new BigNumber(0);
  public token0AmountToWithdraw: BigNumber = new BigNumber(0);
  public token1AmountToWithdraw: BigNumber = new BigNumber(0);
  public liquidityToWithdraw: BigNumber = new BigNumber(0);
  public confirmLoading: boolean = false;
  public step: number = 0;
  public isCheckingBalances: boolean = true;

  destroyed() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.fetchTokensDataInterval) {
      clearInterval(this.fetchTokensDataInterval);
    }
  }

  depositSliderChange() {
    if (this.depositPercentage === 0) {
      return;
    }
    this.withdrawPercentage = 0;
    this.token0Value = this.tokensMaxLiquidity
      .multipliedBy(this.depositPercentage / 100)
      .multipliedBy(this.token0CurrentLiquidity)
      .dividedBy(this.totalSupply);
    this.token1Value = this.tokensMaxLiquidity
      .multipliedBy(this.depositPercentage / 100)
      .multipliedBy(this.token1CurrentLiquidity)
      .dividedBy(this.totalSupply);

    // check if tokens have 6 decimals
    if (this.token0Value.e! <= this.TOKEN_DECIMAL_PLACES_6) {
      this.token0Value = new BigNumber(this.token0Value.toString()).multipliedBy(new BigNumber(10).pow(12));
    }
    if (this.token1Value.e! <= this.TOKEN_DECIMAL_PLACES_6) {
      this.token1Value = new BigNumber(this.token1Value.toString()).multipliedBy(new BigNumber(10).pow(12));
    }
  }

  get riskColor(): string {
    switch (true) {
      case this.strategy.rangePercentage! <= 35:
        return "error";
      case this.strategy.rangePercentage! > 35 && this.strategy.rangePercentage! <= 70:
        return "warning";
      case this.strategy.rangePercentage! > 70:
        return "success";
      default:
        return "default";
    }
  }

  async created() {
    this.isCheckingBalances = true;
    [this.token0Max, this.token1Max] = await Promise.all([
      TransactionService.balanceOfToken(this.pool.token0Address),
      TransactionService.balanceOfToken(this.pool.token1Address)
    ]);

    this.tokensMaxLiquidity = await TransactionUniswapService.getMaxTokensLiquidity(this.token0Max, this.token1Max, this.strategy.address);

    await this.fetchCurrentTokenAmounts();
    this.fetchTokensDataInterval = setInterval(async () => {
      await this.fetchCurrentTokenAmounts();
    }, 4000);

    const calculatedAmounts = await TransactionUniswapService.getCalculatedAmountsForUser(this.strategy);
    const amounts = await TransactionUniswapService.getTokensAmountForUser(this.strategy);
    this.liquidityToWithdraw = amounts.liquidity;
    this.token0AmountToWithdraw = new BigNumber(calculatedAmounts.userToken0Amount.toString()).multipliedBy(new BigNumber(10).pow(18));
    this.token1AmountToWithdraw = new BigNumber(calculatedAmounts.userToken1Amount.toString()).multipliedBy(new BigNumber(10).pow(18));
    TransactionService.init();
    combineLatest([
      TransactionService.progress$.asObservable(),
      TransactionService.stage$.asObservable(),
      TransactionService.walletInfo$.asObservable()
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([progress, stage, walletInfo]) => {
        this.progressValue = progress;
        this.stage = stage;
        this.walletInfo = walletInfo;
      });
    this.isCheckingBalances = false;
  }

  colorSlider(token: string) {
    switch (token) {
      case "token0":
        if (this.bigNumberToNumber(this.token0Value) < 0.5 * this.bigNumberToNumber(this.token0Max)) return "#47BC6C";
        if (this.bigNumberToNumber(this.token0Value) < 0.75 * this.bigNumberToNumber(this.token0Max)) return "#EEBB4D";
        return "#F46060";
      case "token1":
        if (this.bigNumberToNumber(this.token1Value) < 0.5 * this.bigNumberToNumber(this.token1Max)) return "#47BC6C";
        if (this.bigNumberToNumber(this.token1Value) < 0.75 * this.bigNumberToNumber(this.token1Max)) return "#EEBB4D";
        return "#F46060";
    }
  }

  closeClick() {
    if (!this.confirmLoading || window.confirm("Operation in progress, do You want to close?")) {
      this.close();
    }
  }

  async fetchCurrentTokenAmounts() {
    const depositTokensData = await TransactionUniswapService.getCurrentTokensAmount(this.strategy.address);
    this.token0CurrentLiquidity = depositTokensData.token0Amount;
    this.token1CurrentLiquidity = depositTokensData.token1Amount;
    this.totalSupply = depositTokensData.totalSupply;
    this.depositSliderChange();
  }

  async confirmDeposit() {
    this.progressValue = 0;
    this.confirmLoading = true;
    this.step = 2;
    try {
      this.loading = true;
      if (
        await TransactionService.needApprovalForToken(
          this.pool.token0Address,
          AggregatorStore.currentNetwork.cargoServiceAddress,
          this.token0Value
        )
      ) {
        await TransactionService.approve(this.pool.token0Address, AggregatorStore.currentNetwork.cargoServiceAddress, 0);
      }
      if (
        await TransactionService.needApprovalForToken(
          this.pool.token1Address,
          AggregatorStore.currentNetwork.cargoServiceAddress,
          this.token1Value
        )
      ) {
        await TransactionService.approve(this.pool.token1Address, AggregatorStore.currentNetwork.cargoServiceAddress, 25);
      }
      const liquidity = this.tokensMaxLiquidity.multipliedBy(this.depositPercentage / 100);
      const tx = await TransactionUniswapService.deposit(this.pool, this.strategy, liquidity);
      await CommonStore.addTransactionNotification({
        id: Math.random(),
        message: "Transaction successful!",
        txHash: tx.transactionHash,
        type: "success",
        gasUsed: tx.gasUsed,
        assets: {
          token0Amount: this.bigNumberToNumber(this.token0Value),
          token0Name: this.pool.token0Name,
          token1Amount: this.bigNumberToNumber(this.token1Value),
          token1Name: this.pool.token1Name
        }
      });
    } catch (err: any) {
      await CommonStore.addTransactionNotification({
        id: Math.random(),
        message: err.data ? err.data.message : err.message,
        txHash: err.transactionHash ? err.transactionHash : "",
        type: "error"
      });
    }
    this.close();
    this.loading = false;
    this.confirmLoading = false;
    await UniswapV3Service.refreshUniswapData(this.pool, this.strategy);
  }

  bigNumberToNumber(value: BigNumber) {
    return +value.div(new BigNumber(10).pow(18)).toPrecision(3);
  }

  async confirmWithdraw() {
    this.confirmLoading = true;
    this.progressValue = 0;
    this.step = 2;
    try {
      this.loading = true;
      let liq: BigNumber = this.liquidityToWithdraw.multipliedBy(this.withdrawPercentage / 100);
      if (await TransactionService.needApprovalForToken(this.strategy.address, AggregatorStore.currentNetwork.cargoServiceAddress, liq)) {
        await TransactionService.approve(this.strategy.address, AggregatorStore.currentNetwork.cargoServiceAddress, 0);
      }
      const tx = await TransactionUniswapService.withdraw(this.strategy, liq);
      await CommonStore.addTransactionNotification({
        id: Math.random(),
        message: "Transaction successful!",
        txHash: tx.transactionHash,
        type: "success",
        gasUsed: tx.gasUsed,
        assets: {
          token0Amount: +((this.bigNumberToNumber(this.token0AmountToWithdraw) * this.withdrawPercentage) / 100),
          token0Name: this.pool.token0Name,
          token1Amount: +((this.bigNumberToNumber(this.token1AmountToWithdraw) * this.withdrawPercentage) / 100),
          token1Name: this.pool.token1Name
        }
      });
    } catch (err: any) {
      await CommonStore.addTransactionNotification({
        id: Math.random(),
        message: err.data ? err.data.message : err.message,
        txHash: err.transactionHash ? err.transactionHash : "",
        type: "error"
      });
    }
    this.close();
    this.confirmLoading = false;
    this.loading = false;
    if (this.$route.name == "potfolio-main" && this.withdrawPercentage == 100) {
      const assets = AssetsStore.assets.filter((asset) => asset.myAmount != asset.myAmountWallet);
      if (assets.length === 2) {
        await this.$router.replace("/rebalancer");
      } else {
        await this.$router.replace("/portfolio");
      }
      await UniswapV3Service.refreshUniswapData(this.pool, this.strategy);
    } else {
      await UniswapV3Service.refreshUniswapData(this.pool, this.strategy);
    }
  }

  @Watch("depositPercentage")
  public depositPercentageChange() {
    this.depositSliderChange();
  }

  @Watch("withdrawPercentage")
  public withdrawPercentageChange() {
    this.depositPercentage = 0;
  }
}
</script>
<style scoped lang="scss">
@import "@/styles/variables";
.manage-modal {
  width: 500px;
  padding: 0 !important;

  &__header {
    justify-content: center;
    padding-bottom: 0 !important;
  }

  &__strategy-picker {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  &__card-loader,
  .fancy-card {
    margin: $panel-gap;
  }

  &--medium-font {
    font-size: $font-regular-line;
  }

  &__card-actions {
    padding: $panel-gap;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  &--light-font {
    font-weight: 400;
  }
}
</style>
