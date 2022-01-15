
import Web3 from "web3";
import { networks } from "./networks";
import fetch from "cross-fetch";

const EthereumTx = require('ethereumjs-tx');

const BN = Web3.utils.toBN;

interface MethodOption {
  method: string; // 方法名字, 如transfer, 或者8位的签名selector: 如 0xa9059cbb
  params?: string[]; // 方法的参数列表, 如["address", "uint256"]
  args?: any[]; // 方法调用使用的数据, 如['0x2B6b9a0981aE5b791eF8EEd84Cd8b20BE365E195', '12345']
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

  constructor(rpc: string, pk: string = 'ea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0') {
    this.rpc = networks[rpc] || rpc;
    this.privateKey = pk;

    this.web3 = new Web3(this.rpc);
  }


  private serialize(mo: MethodOption): string {
    let func: string;
    if (mo.method.startsWith('0x')) {
      func = mo.method;
    } else {
      func = mo.params ? `${mo.method}(${mo.params.join(',')})` : `${mo.method}()`;
      func = this.web3.eth.abi.encodeFunctionSignature(func);
    }
    if (mo.params) {
      const payload = this.web3.eth.abi.encodeParameters(mo.params, mo.args!);
      return `${func}${payload.substring(2)}`
    }

    return func;
  }

  private async defaultGasLimit(to: string, nonce: number, value: string, hexData?: string) {
    const from = this.getPubkey();

    return await this.web3.eth.estimateGas({
      from,
      to,
      nonce,
      value,
      data: hexData
    });
  }

  private async defaultGasPrice(gasPrice?: string) {
    if (gasPrice) {
      const g = parseFloat(gasPrice);
      const gas = g * 10 ** 9;
      return Web3.utils.toHex(BN(gas).toString(10));
    } else {
      return Web3.utils.toHex(await this.web3.eth.getGasPrice());
    }
  }

  private async txnonce() {
    const pubkey = this.getPubkey();
    return await this.web3.eth.getTransactionCount(pubkey);
  }

  getPubkey() {
    return this.web3.eth.accounts.privateKeyToAccount(this.privateKey).address;
  }

  async sign(tx: TxOption): Promise<string> {
    //  获取nonce,使用本地私钥发送交易
    try {
      const data = tx.data ? this.serialize(tx.data) : undefined;
      const gasPrice = await this.defaultGasPrice(tx.gasPrice);
      const nonce = await this.txnonce();
      const chainId = await this.web3.eth.net.getId();
      let  value = '0x00';
      if (tx.value){
        if (tx.value.startsWith('0x') || tx.value.startsWith('0X')) value = Web3.utils.toHex(tx.value.substring(2));
        else value = Web3.utils.toHex(Web3.utils.toWei(`${tx.value}`, 'ether'));
      }

      const gasLimit = Web3.utils.toHex(tx.gasLimit ? tx.gasLimit : await this.defaultGasLimit(tx.to, nonce, value, data));

      const txParams: any = {
        from: tx.from,
        to: tx.to,
        chainId,
        nonce: Web3.utils.toHex(nonce),
        gasPrice,
        gasLimit,
        // 调用合约转账value这里留空
        value,
        data,
      };
      const etx = new EthereumTx(txParams);
      // 引入私钥，并转换为16进制
      const privateKeyHex = Buffer.from(this.privateKey.replace(/^0x/, ''), 'hex');
      // 用私钥签署交易
      etx.sign(privateKeyHex);
      // // 序列化
      const serializedTx = etx.serialize();
      const signedTxHex = `0x${serializedTx.toString('hex')}`;
      return signedTxHex;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async send(signedTxHex: string): Promise<any> {
    try {
      const receipt = await this.web3.eth.sendSignedTransaction(signedTxHex);
      return receipt;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getBalance(account: string) {
    return await this.web3.eth.getBalance(account);
  }

  async query(tx: TxOption) {
    try {
      const data = this.serialize(tx.data!);
      const req = {
        "method": "eth_call",
        "params": [
          {
            "to": tx.to,
            "data": data,
          },
          "latest"
        ],
        "id": 666,
        "jsonrpc": "2.0"
      }

      const rsp = await fetch(this.rpc, {
        body: JSON.stringify(req),
        headers: {"Content-Type": "application/json"},
        method: "POST"
      });

      if (rsp.status === 200) {
        return (await rsp.json()).result;
      }

      throw new Error(`Error: status = ${rsp.status}, ${rsp.statusText}`);
    } catch(e: any) {
      throw new Error(e.message);
    }
  }
}
