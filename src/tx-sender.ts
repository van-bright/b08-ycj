
import Web3 from "web3";
const EthereumTx = require('ethereumjs-tx');

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

  constructor(network: string, pk: string, contract: string, selector: string, params: string[], data: string[], value: string = '0', gasPrice: number = 0) {
    this.network = network;
    this.privateKey = pk;
    this.contract = contract;
    this.selector = selector;
    this.params = params;
    this.data = data;
    this.gasPrice = gasPrice;
    this.value = value;

    this.web3 = new Web3(network);
  }


serialize(sig: string, params: string[], dataes: string[]): string {
  const selector = sig.startsWith('0x') ? sig : this.web3.eth.abi.encodeFunctionSignature(sig);
  const payload = this.web3.eth.abi.encodeParameters(params, dataes);
  return `${selector}${payload.substr(2)}`;
}

async defaultGasLimit(cntr: string, nonce: number, value: string, hexData: string) {
  const account = this.private2Account();
  const from = account.address;

  return await this.web3.eth.estimateGas({
    from,
    to: cntr,
    nonce,
    value,
    data: hexData
  });
}

private2Account() {
  return this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
}

async defaultGasPrice() {
  return this.gasPrice === 0 ?
    Web3.utils.toHex(await this.web3.eth.getGasPrice()) :
    Web3.utils.toHex(parseInt(`${this.gasPrice}000000000`));
}

async txnonce() {
  const account = this.private2Account();
  const pubkey = account.address
  return await this.web3.eth.getTransactionCount(pubkey);
}

async send(): Promise<any> {
  //  获取nonce,使用本地私钥发送交易
  try {
    const data = this.serialize(this.selector, this.params, this.data);
    const gasPrice = await this.defaultGasPrice();
    const nonce = await this.txnonce();
    const chainId = await this.web3.eth.net.getId();
    const value = this.value !== '0' ? this.web3.utils.toHex(this.web3.utils.toWei(`${this.value}`, 'ether')) : '0x00';
    const gasLimit = Web3.utils.toHex(await this.defaultGasLimit(this.contract, nonce, value, data));

    // console.log(`send request:
    //   data: ${data},
    //   gasPrice: ${gasPrice}
    //   nonce: ${nonce},
    //   chainId: ${chainId}
    //   gasLimit: ${gasLimit}
    //   value: ${value}`
    // );

    const txParams: any = {
      chainId,
      nonce: Web3.utils.toHex(nonce),
      gasPrice,
      gasLimit,
      to: this.contract,
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

    const receipt = await this.web3.eth.sendSignedTransaction(signedTxHex);
    return receipt;
  } catch (e: any) {
    throw new Error(e.message);
  }
}
}
