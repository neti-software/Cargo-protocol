<template>
  <div>
    <back-nav-btn backLocationName="admin-strategies" />
    <v-card class="new-strategy">
      <v-card-title v-if="!editMode">New Strategy</v-card-title>
      <v-card-title v-if="editMode">Edit Strategy</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field v-model="strategy.address" :rules="addressRules" label="Strategy Address" required></v-text-field>
          <v-text-field v-model="strategy.name" :rules="defaultRules" label="Strategy Name" required></v-text-field>
          <v-text-field v-model="strategy.rangePercentage" :rules="numberRules" label="Range Percentage" required></v-text-field>

          <div class="d-flex align-center justify-space-between scheduler">
            <v-text-field
              type="number"
              v-model="scheduler.amount"
              :rules="numberRules"
              label="Execute changing ticks every"
              required
            ></v-text-field>
            <v-select v-model="scheduler.unit" :rules="defaultRules" :items="unit" required class="ml-10"></v-select>
          </div>
          <v-text-field v-model="strategy.stakingProtocolAddress" label="Staking Protocol Address"></v-text-field>
          <v-text-field v-model="strategy.apy" label="APY"></v-text-field>

          <div class="d-flex align-center justify-space-between">
            <v-text-field
              class="mr-5"
              v-if="editMode"
              disabled
              v-model="strategy.apyFromFeesWeekly"
              label="Calculated APY from the last 7 days"
            ></v-text-field>

            <div v-if="editMode">
              <span @click="openDetails('weekly')">
                <slot name="action">
                  <v-btn rounded color="primary" :outlined="apyWeeklyDetailsOpened" :disabled="!strategy.feesWeekly">
                    <div v-bind:class="{rotate: apyWeeklyDetailsOpened}">
                      <span v-if="apyWeeklyDetailsOpened">Hide details</span>
                      <span v-else>Show details</span>
                    </div>
                    <v-icon v-if="!apyWeeklyDetailsOpened">mdi-arrow-down</v-icon>
                    <v-icon v-if="apyWeeklyDetailsOpened">mdi-arrow-up</v-icon>
                  </v-btn>
                </slot>
              </span>
            </div>
          </div>

          <transition name="details" mode="out-in">
            <div v-if="apyWeeklyDetailsOpened">
              <strategy-apy-weekly-details v-if="editMode" :strategy="strategy" />
            </div>
          </transition>

          <div class="d-flex align-center justify-space-between">
            <v-text-field
              class="mr-5"
              v-if="editMode"
              disabled
              v-model="strategy.apyFromFeesAnnual"
              label="Calculated APY (annual data)"
            ></v-text-field>

            <div v-if="editMode">
              <span @click="openDetails('annual')">
                <slot name="action">
                  <v-btn rounded color="primary" :outlined="apyAnnualDetailsOpened" :disabled="!strategy.feesAnnual">
                    <div v-bind:class="{rotate: apyAnnualDetailsOpened}">
                      <span v-if="apyAnnualDetailsOpened">Hide details</span>
                      <span v-else>Show details</span>
                    </div>
                    <v-icon v-if="!apyAnnualDetailsOpened">mdi-arrow-down</v-icon>
                    <v-icon v-if="apyAnnualDetailsOpened">mdi-arrow-up</v-icon>
                  </v-btn>
                </slot>
              </span>
            </div>
          </div>

          <transition name="details" mode="out-in">
            <div v-if="apyAnnualDetailsOpened">
              <strategy-apy-annual-details :strategy="strategy" />
            </div>
          </transition>

          <div class="d-flex flex-row justify-space-between mt-3">
            <v-btn color="error" @click="reset">Cancel</v-btn>
            <v-spacer />
            <v-btn :disabled="!valid" color="success" @click="validate">Save</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import {Component, Vue, Ref} from "vue-property-decorator";
import StrategiesStore from "@/store/strategies.store";
import BackNavBtn from "@/modules/_shared/back-nav-btn/back-nav-btn.vue";
import {Strategy} from "@/interfaces";
import UniswapV3Service from "@/services/uniswapV3.service";
import {ADDRESS_REGEX} from "@/modules/_shared/Validation";
import StrategyApyWeeklyDetails from "./components/strategy-apy-weekly-details.vue";
import StrategyApyAnnualDetails from "./components/strategy-apy-annual-details.vue";

@Component({components: {BackNavBtn, StrategyApyWeeklyDetails, StrategyApyAnnualDetails}})
export default class AddStrategy extends Vue {
  @Ref() form!: any;

  public valid: boolean = true;
  public editMode: boolean = this.$route.params.sid ? true : false;
  public strategy: Strategy = {
    poolId: this.$route.params.pid,
    address: "",
    name: "",
    rangePercentage: null,
    executionPeriod: "",
    stakingProtocolAddress: null,
    apy: null
  };

  public unit = ["minutes", "hours", "days"];
  public scheduler: {amount: number | null; unit: string} = {
    amount: null,
    unit: ""
  };

  public calculatedApyWeekly: string = "";
  public calculatedApyAnnual: string = "";
  public apyWeeklyDetailsOpened: boolean = false;
  public apyAnnualDetailsOpened: boolean = false;
  public totalTvlUSD: number = 0;

  created() {
    setTimeout(() => {
      if (this.editMode) {
        const strategy = StrategiesStore.strategies.find((strategy) => strategy.id == this.$route.params.sid);
        Object.assign(this.strategy, strategy);
        this.strategy.apyFromFeesWeekly = `${this.strategy.apyFromFeesWeekly} %`;
        this.strategy.apyFromFeesAnnual = `${this.strategy.apyFromFeesAnnual} %`;

        const executionPeriod = strategy!.executionPeriod!.split(" ");
        this.scheduler.amount = +executionPeriod[0];
        this.scheduler.unit = executionPeriod[1];
      }
    }, 500);
  }

  public defaultRules = [(v: string) => !!v || "Required"];
  public addressRules = [...this.defaultRules, (v: string) => (v && ADDRESS_REGEX.test(v)) || "Address is wrong format"];
  public numberRules = [...this.defaultRules, (v: number) => (v > 0 && v <= 100) || "The value must be between 0 and 100"];

  async validate() {
    this.form.validate();
    const preparedStrategy: Strategy = {
      ...this.strategy,
      address: this.strategy.address.toLowerCase(),
      executionPeriod: `${this.scheduler.amount} ${this.scheduler.unit}`,
      apy: this.editMode ? this.strategy.apy : null
    };
    delete preparedStrategy.apyFromFeesWeekly;
    delete preparedStrategy.apyFromFeesAnnual;

    if (this.editMode) await StrategiesStore.editStrategy(preparedStrategy);
    else await StrategiesStore.addStrategy(preparedStrategy);

    await UniswapV3Service.fetchAdminData();
    await this.$router.push({name: "admin-strategies"});
  }

  async reset() {
    this.form.reset();
    await this.$router.push({name: "admin-strategies"});
  }

  openDetails(apy: string) {
    switch (apy) {
      case "weekly":
        this.apyWeeklyDetailsOpened = !this.apyWeeklyDetailsOpened;
        return;
      case "annual":
        this.apyAnnualDetailsOpened = !this.apyAnnualDetailsOpened;
        return;
    }
  }
}
</script>

<style scoped lang="scss">
.new-strategy {
  width: 700px;

  & .scheduler .v-select {
    width: 230px;
  }
}

.details-enter-active {
  transition: all 0.3s ease;
}

.details-leave-active {
  transition: all 0.3s ease;
}

.details-enter,
.details-leave-to {
  overflow: hidden;
  transform: translateY(-50px);
  max-height: 0;
  opacity: 0;
  z-index: 0;
}

.details-enter-to,
.details-leave {
  max-height: 550px;
  overflow: hidden;
}
</style>
