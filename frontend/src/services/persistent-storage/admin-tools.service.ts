import { PersistentStorage } from "./persistent-storage.service";

export interface AdminToolsProps {
  tokensProportion: {
    cargoServiceAddress: string;
    cargoPoolAddress: string;
  }
}

export default new PersistentStorage<AdminToolsProps>('admin-tools');
