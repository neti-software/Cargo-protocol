export interface Admin {
  id?: string;
  address: string;
  name: string;
  role: string;
}

export enum AdminRole {
  ADMIN = "admin",
  CELO = "celo"
}
