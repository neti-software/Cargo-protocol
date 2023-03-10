<template>
  <v-card class="tokens-list">
    <div class="d-flex align-center justify-space-between">
      <v-card-title>Network tokens</v-card-title>
      <v-btn :to="{name: 'admin-tokens-edit', params: {id: $route.params.id}}" class="mr-5" color="primary">
        <v-icon left>mdi-plus</v-icon>
        Add token
      </v-btn>
    </div>

    <v-data-table :headers="headers" :items="tokens" class="elevation-0" hide-default-footer disable-pagination>
      <template v-slot:item="props">
        <tr>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.address }}</td>

          <td>
            <v-btn class="button-color" small :color="props.item.color"
              ><span class="button-color--text">{{ props.item.color }}</span></v-btn
            >
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
import AssetsStore from "@/store/assets.store";
import UniswapV3Service from "@/services/uniswapV3.service";

@Component({})
export default class Tokens extends Vue {
  readonly headers = [
    {
      text: "Name",
      value: "name",
      sortable: false
    },
    {
      text: "Address",
      value: "address",
      sortable: false
    },
    {
      text: "Color",
      value: "color",
      sortable: false
    },
    {
      text: "",
      sortable: false
    }
  ];
  public originalTokens = AssetsStore.assets;
  public reorderLoading = false;
  public deletingTimer = 0;
  public deletingTimerId: ReturnType<typeof setInterval> | undefined = undefined;

  get tokens() {
    return this.originalTokens
      .filter((token) => token.networkId === this.$route.params.id)
      .map((token) => {
        return {
          deleteProgressBar: false,
          ...token
        };
      });
  }

  set tokens(value) {
    this.originalTokens = value;
  }

  askDelete(id: string) {
    this.tokens.find((token) => token.id === id)!.deleteProgressBar = true;
    this.deletingTimer = 100;
    this.deletingTimerId = setInterval(() => {
      this.deletingTimer--;
      if (!this.deletingTimer) this.rejectDelete(id);
    }, 50);
  }

  rejectDelete(id: string) {
    this.tokens.find((token) => token.id === id)!.deleteProgressBar = false;
    if (this.deletingTimerId) clearInterval(this.deletingTimerId!);
    this.deletingTimerId = undefined;
  }

  async confirmDelete(id: string) {
    this.rejectDelete(id);
    Promise.all([await AssetsStore.deleteAsset(id), await UniswapV3Service.fetchAdminData()]);
    this.tokens = AssetsStore.assets
      .filter((token) => token.networkId === this.$route.params.id)
      .map((token) => {
        return {
          deleteProgressBar: false,
          ...token
        };
      });
  }

  async edit(tokenId: string) {
    await this.$router.push({name: "admin-tokens-edit", params: {id: this.$route.params.id, tid: tokenId}});
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.tokens-list {
  width: 1000px;
}

.button-color {
  pointer-events: none;

  &--text {
    font-size: $font-sm;
  }
}
</style>
