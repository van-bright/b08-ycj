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
    private getPubkey;
    private defaultGasPrice;
    private txnonce;
    sign(tx: TxOption): Promise<string>;
    send(signedTxHex: string): Promise<any>;
    query(tx: TxOption): Promise<any>;
}
export {};
