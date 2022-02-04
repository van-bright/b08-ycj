import Web3 from "web3";
interface MethodOption {
    method: string;
    params?: string[];
    args?: any[];
}
export interface TxOption {
    from?: string;
    to: string;
    data?: MethodOption;
    gasPrice?: string;
    gasLimit?: string;
    value?: string;
}
export default class TxSender {
    rpc: string;
    privateKey: string;
    web3: Web3;
    constructor(rpc: string, pk?: string);
    private serialize;
    private defaultGasLimit;
    private defaultGasPrice;
    private txnonce;
    getPubkey(): string;
    sign(tx: TxOption): Promise<string>;
    send(signedTxHex: string): Promise<any>;
    getBalance(account: string): Promise<string>;
    query(tx: TxOption): Promise<any>;
    static decode(type: string, hexStr: string): {
        [key: string]: any;
    };
}
export {};
