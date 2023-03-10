import { WalletEnum } from "@/interfaces/wallet.enum";
import { PersistentStorage } from "./persistent-storage.service";

export default new PersistentStorage<WalletEnum>('wallet-provider');
