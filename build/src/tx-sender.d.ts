import Web3 from "web3";
export default class TxSender {
    network: string;
    privateKey: string;
    contract: string;
    selector: string;
    params: string[];
    data: string[];
    gasPrice: number;
    value: string;
    web3: Web3;
    constructor(network: string, pk: string, contract: string, selector: string, params: string[], data: string[], value?: string, gasPrice?: number);
    serialize(sig: string, params: string[], dataes: string[]): string;
    defaultGasLimit(cntr: string, nonce: number, value: string, hexData: string): Promise<number>;
    private2Account(): import("web3-core").Account;
    defaultGasPrice(): Promise<string>;
    txnonce(): Promise<number>;
    send(): Promise<any>;
}
