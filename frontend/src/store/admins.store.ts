import {Action, getModule, Module, Mutation, VuexModule} from "vuex-module-decorators";
import store from "./index";
import {Admin} from "@/interfaces";
import {ApiService} from "@/services/api.service";

@Module({
  name: "_admins-store",
  dynamic: true,
  namespaced: true,
  store
})
export class AdminsModule extends VuexModule {
  private _admins: Admin[] = [];

  get admins() {
    return this._admins;
  }

  @Mutation
  private writeAdmins(admins: Admin[]) {
    this._admins.length = 0;
    admins.forEach((item) => this._admins.push(item));
  }

  @Mutation
  private removeAdmins() {
    this._admins.length = 0;
  }

  @Action({rawError: true})
  public async cleanAdmins() {
    this.removeAdmins();
  }

  @Action({rawError: true})
  public async getAdmins() {
    const admins = (await ApiService.get<Admin>("admin").toPromise()) as unknown;
    return admins as Admin[];
  }

  @Action({rawError: true})
  public async saveAdmins(admins: Admin[]) {
    this.writeAdmins(admins);
  }

  @Action({rawError: true})
  public async addAdmin(admin: Admin) {
    await ApiService.post<Admin>("admin", admin).toPromise();
  }

  @Action({rawError: true})
  public async deleteAdmin(id: string) {
    await ApiService.delete<Admin>(`admin/${id}`).toPromise();
  }
}

const AdminsStore = getModule(AdminsModule);
export default AdminsStore;
