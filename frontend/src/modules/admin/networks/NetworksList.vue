<template>
  <v-card class="networks-list">
    <div class="d-flex align-center justify-space-between">
      <v-card-title>Networks</v-card-title>
      <v-btn :to="{name: 'admin-networks-edit'}" class="mr-5" color="primary">
        <v-icon left>mdi-plus</v-icon>
        Add network
      </v-btn>
    </div>

    <v-data-table :headers="headers" :items="networks" class="elevation-0" hide-default-footer disable-pagination>
      <template v-slot:item="props">
        <tr>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.platform }}</td>
          <td>{{ props.item.chainId }}</td>
          <td>{{ props.item.networkUrl }}</td>
          <td>
            <v-simple-checkbox
              color="primary"
              v-model="props.item.isActive"
              @click="changeActive(props.item.id, props.item.isActive)"
            ></v-simple-checkbox>
          </td>
          <td>{{ props.item.numberOfPools }}</td>
          <td>
            <v-btn :to="{name: 'admin-pools-and-tokens', params: {id: props.item.id}}">Pools</v-btn>
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
import CommonStore from "@/store/common.store";

@Component({})
export default class NetworksList extends Vue {
  private readonly headers = [
    {
      text: "Name",
      value: "name",
      sortable: true
    },
    {
      text: "Platform",
      value: "platform",
      sortable: true
    },
    {
      text: "Chain ID",
      value: "chainId",
      sortable: true
    },
    {
      text: "Network URL",
      value: "networkUrl",
      sortable: false
    },
    {
      text: "Active",
      value: "isActive",
      sortable: false
    },
    {
      text: "Pools",
      value: "numberOfPools",
      sortable: true
    },

    {
      text: "Pools",
      sortable: false
    },
    {
      text: "",
      sortable: false
    }
  ];
  public deletingTimer = 0;
  public deletingTimerId: ReturnType<typeof setInterval> | undefined = undefined;
  public originalNetworks = AggregatorStore.networks;

  get networks() {
    return this.originalNetworks.map((network) => ({
      deleteProgressBar: false,
      numberOfPools: AggregatorStore.pools.filter((pool) => pool.networkId === network.id).length,
      ...network
    }));
  }

  set networks(value) {
    this.originalNetworks = value;
  }

  askDelete(id: string) {
    this.networks.find((network) => network.id === id)!.deleteProgressBar = true;
    this.deletingTimer = 100;
    this.deletingTimerId = setInterval(() => {
      this.deletingTimer--;
      if (!this.deletingTimer) this.rejectDelete(id);
    }, 50);
  }

  rejectDelete(id: string) {
    this.networks.find((network) => network.id === id)!.deleteProgressBar = false;
    if (this.deletingTimerId) clearInterval(this.deletingTimerId!);
    this.deletingTimerId = undefined;
  }

  async confirmDelete(id: string) {
    this.rejectDelete(id);
    Promise.all([await AggregatorStore.deleteNetwork(id), await AggregatorStore.cleanNetworks(), await AggregatorStore.fetchNetworks()]);
    this.networks = AggregatorStore.networks.map((network) => ({
      deleteProgressBar: false,
      numberOfPools: AggregatorStore.pools.filter((pool) => pool.networkId === network.id).length,
      ...network
    }));
  }

  async edit(id: string) {
    await this.$router.push({name: "admin-networks-edit", params: {id}});
  }

  async changeActive(id: string, isActive: boolean) {
    const network = await AggregatorStore.getNetworkById(id);
    network.isActive = isActive;
    await Promise.all([
      await AggregatorStore.editNetwork(network),
      await AggregatorStore.cleanNetworks(),
      await AggregatorStore.fetchNetworks(),
      await CommonStore.saveProvider(network.networkUrl)
    ]);
  }
}
</script>

<style scoped lang="scss">
.networks-list {
  width: 1400px;
}
</style>
