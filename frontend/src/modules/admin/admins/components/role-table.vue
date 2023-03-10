<template>
  <v-data-table
    :headers="headers"
    :items="admins.filter((admin) => admin.role == role)"
    class="elevation-0"
    hide-default-footer
    disable-pagination
  >
    <template v-slot:item="props">
      <tr>
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.address }}</td>
        <td>
          <div class="actions" v-if="!props.item.deleteProgressBar">
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
</template>

<script lang="ts">
import {Vue, Component, Prop} from "vue-property-decorator";
import AdminsStore from "@/store/admins.store";

@Component({})
export default class RoleTable extends Vue {
  @Prop({required: true}) role!: string;

  private readonly headers = [
    {
      text: "Name",
      value: "name",
      sortable: true
    },
    {
      text: "Address",
      value: "address",
      sortable: true
    },
    {
      text: "",
      sortable: false
    }
  ];
  public deletingTimer = 0;
  public deletingTimerId: ReturnType<typeof setInterval> | undefined = undefined;
  public originalAdmins = AdminsStore.admins;

  get admins() {
    return this.originalAdmins.map((admin) => ({
      deleteProgressBar: false,
      ...admin
    }));
  }

  set admins(value) {
    this.originalAdmins = value;
  }

  askDelete(id: string) {
    this.admins.find((network) => network.id === id)!.deleteProgressBar = true;
    this.deletingTimer = 100;
    this.deletingTimerId = setInterval(() => {
      this.deletingTimer--;
      if (!this.deletingTimer) this.rejectDelete(id);
    }, 50);
  }

  rejectDelete(id: string) {
    this.admins.find((network) => network.id === id)!.deleteProgressBar = false;
    if (this.deletingTimerId) clearInterval(this.deletingTimerId!);
    this.deletingTimerId = undefined;
  }

  async confirmDelete(id: string) {
    this.rejectDelete(id);
    await Promise.all([await AdminsStore.deleteAdmin(id), await AdminsStore.cleanAdmins()]);
    await AdminsStore.getAdmins().then(async (data) => await AdminsStore.saveAdmins(data));

    this.admins = AdminsStore.admins.map((admin) => ({
      deleteProgressBar: false,
      ...admin
    }));
  }
}
</script>

<style scoped lang="scss"></style>
