<template>
  <v-card class="pools-list">
    <div class="d-flex align-center justify-space-between">
      <v-card-title>Pools</v-card-title>
      <v-btn :to="{name: 'admin-pools-edit', params: {id: $route.params.id}}" class="mr-5" color="primary">
        <v-icon left>mdi-plus</v-icon>
        Add pool
      </v-btn>
    </div>
    <v-card-text class="pt-0"
      >Network chain URL <b>{{ network.networkUrl }}</b> and chain ID <b>{{ network.chainId }}</b></v-card-text
    >
    <v-data-table
      :headers="headers"
      :items="pools"
      class="elevation-0"
      hide-default-footer
      disable-pagination
      ref="sortableTable"
      sortBy="order"
      :sort-desc="false"
      :loading="reorderLoading"
    >
      <template v-slot:item="props">
        <tr class="sortableRow" :key="props.item.id">
          <td class="px-1" style="width: 0.1%">
            <v-btn :disabled="reorderLoading" style="cursor: move" icon class="sortHandle"
              ><v-icon>mdi-drag-vertical-variant</v-icon></v-btn
            >
          </td>
          <td>{{ props.item.uniswapPoolAddress }}</td>
          <td>{{ props.item.token0Name }}</td>
          <td>{{ props.item.token1Name }}</td>
          <td>{{ props.item.fee }} %</td>
          <td>
            <v-simple-checkbox
              color="primary"
              v-model="props.item.isActive"
              @click="changeActive(props.item.id, props.item.isActive)"
            ></v-simple-checkbox>
          </td>
          <td>{{ props.item.numberOfStrategies }}</td>
          <td>
            <v-btn :to="{name: 'admin-strategies', params: {id: props.item.networkId, pid: props.item.id}}">Strategies</v-btn>
          </td>
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
</template>

<script lang="ts">
import {Vue, Component} from "vue-property-decorator";
import AggregatorStore from "@/store/aggregator.store";
import {Network, Pool} from "@/interfaces";
import StrategiesStore from "@/store/strategies.store";
import UniswapV3Service from "@/services/uniswapV3.service";
import Sortable from "sortablejs";

@Component({})
export default class Pools extends Vue {
  readonly headers = [
    {
      value: "order",
      sortable: false
    },
    {
      text: "Uniswap Pool Address",
      value: "uniswapPoolAddress",
      sortable: false
    },
    {
      text: "Token0 Name",
      value: "token0Name",
      sortable: false
    },
    {
      text: "Token1 Name",
      value: "token1Name",
      sortable: false
    },
    {
      text: "Fee",
      value: "fee",
      sortable: false
    },
    {
      text: "Active",
      value: "isActive",
      sortable: false
    },
    {
      text: "Strategies",
      value: "numberOfStrategies",
      sortable: false
    },
    {
      text: "Strategies",
      sortable: false
    },
    {
      text: "",
      sortable: false
    }
  ];
  public network: Network = {
    id: "",
    name: "",
    platform: "",
    networkUrl: "",
    chainId: null,
    graphqlUrl: "",
    transportProtocol: "",
    cargoServiceAddress: "",
    isActive: false,
    rpcUrl: ""
  };
  public deletingTimer = 0;
  public deletingTimerId: ReturnType<typeof setInterval> | undefined = undefined;
  public originalPools = AggregatorStore.pools;
  public reorderLoading = false;

  get pools(): (Pool & {deleteProgressBar?: boolean; numberOfStrategies?: number})[] {
    return this.originalPools
      .filter((pool) => pool.networkId === this.$route.params.id)
      .map((pool) => {
        return {
          deleteProgressBar: false,
          numberOfStrategies: StrategiesStore.strategies.filter((strategy) => strategy.poolId === pool.id).length,
          ...pool
        };
      });
  }

  set pools(value) {
    this.originalPools = value;
  }

  async created() {
    this.network = await AggregatorStore.getNetworkById(this.$route.params.id);

    new Sortable((this.$refs.sortableTable as Vue).$el.getElementsByTagName("tbody")[0], {
      draggable: ".sortableRow",
      handle: ".sortHandle",
      onSort: this.dragReorder
    });
  }

  async dragReorder({oldIndex, newIndex}: Sortable.SortableEvent) {
    if (oldIndex === undefined || newIndex === undefined) {
      return;
    }
    this.reorderLoading = true;
    let pool = this.pools.find((pool) => pool.order === oldIndex) || this.pools[oldIndex];
    if (pool) {
      await AggregatorStore.editPoolOrder({id: pool.id || "", order: newIndex});
      await UniswapV3Service.fetchAdminData();
    }
    this.reorderLoading = false;
  }

  askDelete(id: string) {
    this.pools.find((pool) => pool.id === id)!.deleteProgressBar = true;
    this.deletingTimer = 100;
    this.deletingTimerId = setInterval(() => {
      this.deletingTimer--;
      if (!this.deletingTimer) this.rejectDelete(id);
    }, 50);
  }

  rejectDelete(id: string) {
    this.pools.find((pool) => pool.id === id)!.deleteProgressBar = false;
    if (this.deletingTimerId) clearInterval(this.deletingTimerId!);
    this.deletingTimerId = undefined;
  }

  async confirmDelete(id: string) {
    this.rejectDelete(id);
    await Promise.all([await AggregatorStore.deletePool(id), await UniswapV3Service.fetchAdminData()]);
    this.pools = AggregatorStore.pools
      .filter((pool) => pool.networkId === this.$route.params.id)
      .map((pool) => {
        return {
          deleteProgressBar: false,
          numberOfStrategies: StrategiesStore.strategies.filter((strategy) => strategy.poolId === pool.id).length,
          ...pool
        };
      });
  }

  async edit(poolId: string) {
    await this.$router.push({name: "admin-pools-edit", params: {id: this.$route.params.id, pid: poolId}});
  }

  async changeActive(id: string, isActive: boolean) {
    const pool = await AggregatorStore.getPoolById(id);
    pool.isActive = isActive;
    await AggregatorStore.editPool(pool);
  }
}
</script>

<style scoped lang="scss">
.pools-list {
  width: 100%;
}
</style>
