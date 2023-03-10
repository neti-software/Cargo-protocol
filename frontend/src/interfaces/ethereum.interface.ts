export interface RequestArguments {
    method: string;
    params?: unknown[] | object;
}

export interface Ethereum {
    request: (params: RequestArguments) => Promise<string[]>;
    on: (event: string, callback: (...args: any[]) => any) => void;
    removeListener: (event: string, ...args: any[]) => void;
    networkVersion: number;
    isMetaMask?: boolean;
}
