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
    <v-card rounded outlined elevation="10" class="deposit-rewards-modal">
      <v-card-title class="deposit-rewards-modal__header">Deposit reward funds</v-card-title>

      <div v-if="step === 0">
        <div class="deposit-rewards-modal__wrapper">
          <p class="deposit-rewards-modal__text text-center my-0 mb-3" v-if="!depositValue">
            Please type the CELO amount You want to deposit
          </p>

          <p class="deposit-rewards-modal__text deposit-rewards-modal__text--error text-center mt-3">{{ errorMessage }}</p>

          <v-form v-model="valid">
            <v-text-field
              v-model="depositValue"
              :disabled="confirmLoading"
              outlined
              rounded
              suffix="CELO"
              :rules="numberRules"
              required
            ></v-text-field>
          </v-form>
        </div>
        <div class="deposit-rewards-modal__actions">
          <v-btn color="primary" elevation="0" large :loading="confirmLoading" :disabled="!valid" @click="verifyTokenAmount">Next</v-btn>
        </div>
      </div>

      <div v-if="step === 1">
        <div class="deposit-rewards-modal__wrapper">
          <p class="deposit-rewards-modal__text text-center mb-0">Desired amount we are attempting to deposit:</p>
          <p class="text-center mt-2">{{ depositValue }} CELO</p>
        </div>

        <div class="deposit-rewards-modal__actions">
          <v-btn color="primary" elevation="0" large :loading="confirmLoading" @click="confirm">Supply rewards</v-btn>
          <v-btn outlined large elevation="0" @click="step = 0">Back</v-btn>
        </div>
      </div>

      <div v-if="step === 2">
        <div class="deposit-rewards-modal__wrapper">
          <p class="deposit-rewards-modal__text">{{ walletInfo }}</p>
          <p>{{ stage }}</p>
          <v-progress-linear
            class="deposit-rewards-modal__slider"
            color="primary"
            :value="progressValue"
            height="10"
            rounded
            striped
          ></v-progress-linear>
        </div>

        <div class="deposit-rewards-modal__actions">
          <v-btn color="primary" elevation="0" class="ml-5" large :loading="loading" @click="closeClick">Close</v-btn>
          <v-btn outlined large elevation="0" :disabled="step === 2">Back</v-btn>
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
import TransactionCeloService from "@/services/transaction/transaction-celo.service";
import {CeloPair} from "@/interfaces/celo.interface";
import {combineLatest, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import TransactionService from "@/services/transaction/transaction.service";
import CeloStore from "@/store/celo.store";
import CommonStore from "@/store/common.store";

@Component({
  components: {ModalWrapper}
})
export default class DepositRewardsModal extends mixins(ModalMixin) {
  @Prop({required: true}) pair!: CeloPair;

  public valid = false;
  public depositValue: number = 0;
  public errorMessage: string = "";
  public confirmLoading: boolean = false;

  private step: number = 0;
  private stage: string = "";
  private progressValue: number = 0;
  private loading: boolean = false;
  private tokenAddress: string = "";
  private readonly destroy$ = new Subject();
  private walletInfo: string = "";

  destroyed() {}

  created() {
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
  }

  async verifyTokenAmount() {
    this.confirmLoading = true;
    this.errorMessage = "";
    this.tokenAddress = this.pair.token0Name.toLowerCase() === "celo" ? this.pair.token0Address : this.pair.token1Address;
    const celoBalance = await TransactionService.balanceOfToken(this.tokenAddress);
    const bigNumberValue = TransactionService.convertToEherBigNumber(this.depositValue);

    if (!celoBalance.isGreaterThanOrEqualTo(bigNumberValue)) {
      this.errorMessage = `You don't have enough funds`;
      this.confirmLoading = false;
      return;
    }
    this.confirmLoading = false;
    this.step = 1;
  }

  closeClick() {
    if (!this.confirmLoading || window.confirm("Operation in progress, do You want to close?")) {
      this.close();
    }
  }

  async confirm() {
    this.loading = true;
    this.step = 2;
    await TransactionCeloService.deposit(this.depositValue!, this.pair.stakingProtocolAddress, this.tokenAddress);
    this.loading = false;
    this.close();
    CommonStore.startLoading();
    await CeloStore.getCeloPairs();
    CommonStore.stopLoading();
  }
  public numberRules = [
    (v: string) => !!v || "Required",
    (v: number) => (!isNaN(parseFloat(v.toString())) && isFinite(v)) || "The value must be a number"
  ];

  @Watch("depositValue")
  depositValueChanged() {
    this.errorMessage = "";
  }
}
</script>

<style lang="scss">
.deposit-rewards-modal {
  padding: 0 !important;
  width: 500px;

  &__header {
    justify-content: center;
    padding-bottom: 0 !important;
  }

  &__card-actions {
    padding: $panel-gap;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  &__text {
    font-weight: 400;

    &--error {
      color: red;
    }
  }

  &__actions {
    padding: $panel-gap;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
  }

  &__wrapper {
    margin: 20px 30px 5px;
  }

  &__slider {
    margin-bottom: 25px;
  }
}
</style>
