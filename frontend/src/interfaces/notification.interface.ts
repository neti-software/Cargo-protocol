export interface GlobalNotification {
  id: string;
  message: string;
  persistent: boolean;
  type: "info" | "success" | "warning" | "error";
}

export interface TransactionNotification {
  id: number;
  message: string;
  txHash: string;
  type: "info" | "success" | "warning" | "error";
  color?: string;
  icon?: string;
  show?: boolean;
  gasUsed?: string;
  assets?: {
    token0Amount: number;
    token0Name: string;
    token1Amount: number;
    token1Name: string;
  };
}
