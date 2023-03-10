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
    <v-card rounded outlined elevation="10" class="setup-rewards-modal">
      <v-card-title class="setup-rewards-modal__header">Setup rewards</v-card-title>

      <div v-if="step === 0">
        <div class="setup-rewards-modal__wrapper">
          <p v-if="rewardsPercentage === pair.rewardsRate" class="setup-rewards-modal__text my-0 mb-2">
            Please select boost amount percentage
          </p>

          <v-slider v-model="rewardsPercentage" hide-details track-color="grey" always-dirty thumb-label :min="0" :max="300">
            <template v-slot:thumb-label="{value}"> {{ value }}% </template>
          </v-slider>
          <p class="setup-rewards-modal__text">Rewards percentage: {{ rewardsPercentage }} %</p>
        </div>
        <div class="setup-rewards-modal__actions">
          <v-btn color="primary" elevation="0" large :disabled="rewardsPercentage === pair.rewardsRate" @click="confirm">Update</v-btn>
        </div>
      </div>

      <div v-if="step === 1">
        <div class="setup-rewards-modal__wrapper">
          <p class="setup-rewards-modal__text">{{ walletInfo }}</p>
          <p>{{ stage }}</p>
          <v-progress-linear
            class="setup-rewards-modal__slider"
            color="primary"
            :value="progressValue"
            height="10"
            rounded
            striped
          ></v-progress-linear>
        </div>

        <div class="setup-rewards-modal__actions">
          <v-btn outlined large elevation="0" :disabled="step === 1">Back</v-btn>
          <v-btn color="primary" elevation="0" class="ml-5" large :loading="loading" :disabled="loading" @click="closeClick">Close</v-btn>
        </div>
      </div>
    </v-card>
  </modal-wrapper>
</template>

<script lang="ts">
import {Component, Prop} from "vue-property-decorator";
import ModalWrapper from "@/modules/_shared/modals/modal-wrapper/modal-wrapper.vue";
import {mixins} from "vue-class-component";
import ModalMixin from "@/modules/_shared/modals/modal-mixin.vue";
import TransactionCeloService from "@/services/transaction/transaction-celo.service";
import TransactionService from "@/services/transaction/transaction.service";
import {CeloPair} from "@/interfaces/celo.interface";
import {combineLatest, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import CeloStore from "@/store/celo.store";
import CommonStore from "@/store/common.store";

@Component({
  components: {ModalWrapper}
})
export default class SetupRewardsModal extends mixins(ModalMixin) {
  @Prop({required: true}) pair!: CeloPair;

  public rewardsPercentage: number = this.pair.rewardsRate;

  public errorMessage: string = "";
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

  closeClick() {
    if (!this.loading || window.confirm("Operation in progress, do You want to close?")) {
      this.close();
    }
  }

  async confirm() {
    this.loading = true;
    this.step = 1;
    await TransactionCeloService.setupRewards(this.rewardsPercentage, this.pair.stakingProtocolAddress);
    this.loading = false;
    this.close();
    CommonStore.startLoading();
    await CeloStore.getCeloPairs();
    CommonStore.stopLoading();
  }
}
</script>

<style lang="scss">
.setup-rewards-modal {
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
