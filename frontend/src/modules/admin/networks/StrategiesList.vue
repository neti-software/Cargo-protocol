<template>
  <div>
    <back-nav-btn backLocationName="admin-pools-and-tokens" />
    <v-card class="strategies-list">
      <div class="d-flex align-center justify-space-between">
        <v-card-title>Strategies {{ pool.token0Name }}/{{ pool.token1Name }}</v-card-title>
        <v-btn
          :to="{name: 'admin-strategies-edit', params: {id: this.$route.params.id, pid: this.$route.params.pid}}"
          class="mr-5"
          color="primary"
        >
          <v-icon left>mdi-plus</v-icon>
          Add strategy
        </v-btn>
      </div>
      <v-card-text class="pt-0"
        >Uniswap pool address: <b>{{ pool.uniswapPoolAddress }}</b></v-card-text
      >
      <v-data-table :headers="headers" :items="strategies" class="elevation-0" hide-default-footer disable-pagination>
        <template v-slot:item="props">
          <tr>
            <td>{{ props.item.address }}</td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.rangePercentage }}</td>
            <td>{{ props.item.executionPeriod }}</td>
            <td>{{ props.item.apyFromFeesWeekly }} %</td>
            <td>{{ props.item.apyFromFeesAnnual }} %</td>
            <td>
              <div class="actions" v-if="!props.item.deleteProgressBar">
                <v-btn icon color="primary" @click="edit(props.item.id)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon color="error" @click="askDelete(props.item.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
              <div class="actions" v-if="props.item.deleteProgressBar">
                <v-btn color="error" plain @click="confirmDelete(props.item.id)">
                  <v-icon left>mdi-delete</v-icon>
                  Confirm
                  <v-progress-linear
                    v-model="deletingTimer"
                    color="error lighten-2"
                    class="delete-confirm__timeout"
                    rounded
                    value="100"
                  ></v-progress-linear>
                </v-btn>
                <v-btn icon color="white" @click="rejectDelete(props.item.id)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script lang="ts">
import {Vue, Component} from "vue-property-decorator";
import AggregatorStore from "@/store/aggregator.store";
import StrategiesStore from "@/store/strategies.store";
import BackNavBtn from "@/modules/_shared/back-nav-btn/back-nav-btn.vue";
import {Pool} from "@/interfaces/pool.interface";
import UniswapV3Service from "@/services/uniswapV3.service";

@Component({components: {BackNavBtn}})
export default class StrategiesList extends Vue {
  private readonly headers = [
    {
      text: "Strategy address",
      value: "address",
      sortable: false
    },
    {
      text: "Name",
      value: "name",
      sortable: true
    },
    {
      text: "Range [%]",
      value: "rangePercentage",
      sortable: true
    },
    {
      text: "Execute changing ticks every",
      value: "executionPeriod",
      sortable: false
    },
    {
      text: "APY (fees weekly)",
      value: "apyFromFeesWeekly",
      sortable: true
    },
    {
      text: "APY (fees annual)",
      value: "apyFromFeesAnnual",
      sortable: true
    },
    {
      text: "",
      sortable: false
    }
  ];
  public deletingTimer = 0;
  public deletingTimerId: ReturnType<typeof setInterval> | undefined = undefined;
  public pool: Pool = {
    networkId: "",
    token0Name: "",
    token0Address: "",
    token1Name: "",
    token1Address: "",
    fee: null,
    uniswapPoolAddress: ""
  };
  public originalStrategies = StrategiesStore.strategies;

  get strategies() {
    return this.originalStrategies
      .filter((strategy) => strategy.poolId === this.$route.params.pid)
      .map((strategy) => {
        return {
          deleteProgressBar: false,
          ...strategy
        };
      });
  }

  set strategies(value) {
    this.originalStrategies = value;
  }

  async created() {
    this.pool = await AggregatorStore.getPoolById(this.$route.params.pid);
  }

  askDelete(id: string) {
    this.strategies.find((strategy) => strategy.id === id)!.deleteProgressBar = true;
    this.deletingTimer = 100;
    this.deletingTimerId = setInterval(() => {
      this.deletingTimer--;
      if (!this.deletingTimer) this.rejectDelete(id);
    }, 50);
  }

  rejectDelete(id: string) {
    this.strategies.find((strategy) => strategy.id === id)!.deleteProgressBar = false;
    if (this.deletingTimerId) clearInterval(this.deletingTimerId!);
    this.deletingTimerId = undefined;
  }

  async confirmDelete(id: string) {
    this.rejectDelete(id);
    await StrategiesStore.deleteStrategy(id);
    await UniswapV3Service.fetchAdminData();
    this.strategies = StrategiesStore.strategies
      .filter((strategy) => strategy.poolId === this.$route.params.pid)
      .map((strategy) => {
        return {
          deleteProgressBar: false,
          ...strategy
        };
      });
  }

  async edit(strategyId: string) {
    await this.$router.push({
      name: "admin-strategies-edit",
      params: {id: this.$route.params.id, pid: this.$route.params.pid, sid: strategyId}
    });
  }
}
</script>

<style scoped lang="scss">
.strategies-list {
  width: 1300px;
}
</style>
