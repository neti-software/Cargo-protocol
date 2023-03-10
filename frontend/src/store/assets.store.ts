import {Action, getModule, Module, Mutation, VuexModule} from "vuex-module-decorators";
import store from "./index";
import {Token} from "@/interfaces";
import {ApiService} from "@/services/api.service";

@Module({
  name: "_assets-store",
  dynamic: true,
  namespaced: true,
  store
})
export class AssetsModule extends VuexModule {
  private _assets: Token[] = [];

  get assets() {
    return this._assets;
  }

  @Mutation
  private writeAssets(assets: Token[]) {
    this._assets.length = 0;
    assets.forEach((item) => this._assets.push(item));
  }

  @Mutation
  private removeAssets() {
    this._assets.length = 0;
  }

  @Action({rawError: true})
  public async cleanAssets() {
    this.removeAssets();
  }

  @Action({rawError: true})
  public async getAssets(networkId: string) {
    const assets = (await ApiService.get<Token>(`token?networkId=${networkId}`).toPromise()) as unknown;
    return assets as Token[];
  }

  @Action({rawError: true})
  public async getAssetById(id: string): Promise<Token> {
    return (await ApiService.get<Token>(`token/${id}`).toPromise()) as Token;
  }

  @Action({rawError: true})
  public async saveAssets(tokens: Token[]) {
    this.writeAssets(tokens);
  }

  @Action({rawError: true})
  public async addAsset(token: Token) {
    await ApiService.post<Token>("token", token).toPromise();
  }

  @Action({rawError: true})
  public async editAsset(token: Token) {
    await ApiService.put<Token>(`token/${token.id}`, token).toPromise();
  }

  @Action({rawError: true})
  public async deleteAsset(id: string) {
    await ApiService.delete<Token>(`token/${id}`).toPromise();
  }
}

const AssetsStore = getModule(AssetsModule);
export default AssetsStore;
