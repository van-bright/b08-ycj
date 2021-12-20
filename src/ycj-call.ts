#!/usr/bin/env node

import {program} from "commander";
import Web3 from "web3";

import {networks} from "./networks";

const EthereumTx = require('ethereumjs-tx');

program
  .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic"')
  .requiredOption('--contract <contract>', '被调用的合约地址')
  .requiredOption('--sig <sig>', '合约方法签名, 如果知道abi, 填func(uint)格式, 否则填0x12345678格式的方法签名')
  .option('--params <params...>', '合约方法的参数类型列表, 如 --params uint256 uint256 address供')
  .option('--data <data...>', '合约方法的实际参数值, 和--params中提供的参数一一对应')
  .option('--gas-price <gasPrice>', '调用合约使用的gas price, 单位为gwei. 默认使用推荐的gas费')
  .option('--retry <retry>', '重试次数, 默认为1, 即不重试, 发出交易就可以. 0 表示无限次重试, 直到返回成功.')
  .option('--private-key <privateKey>', '签名的私钥')
  .option('--value <value>', '调用时发送的value, 单位为ethers. 默认值为0')

program.parse(process.argv);

const options = program.opts();

const network = options.network;
const contract = options.contract;
const fselector = options.sig;
const fparams = options.params || [];
const fdata = options.data || [];

const gasPrice = parseInt(options.gasPrice) || 0;
const valueToSend = options.value;

const privateKey = options.privateKey || 'ea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0'; // 一个全网公开的私钥, 用来做些查询工作

if (!networks[network] ) throw new Error(`unknow network "${network}"`);

const web3 = new Web3(networks[network]);

function getRetryTimes() {
  const t = parseInt(options.retry);
  if (!t && t !== 0) return 1;
  else return t;
}

function serialize(sig: string, params: string[], dataes: string[]): string {
    const selector = sig.startsWith('0x') ? sig : web3.eth.abi.encodeFunctionSignature(sig);
    const payload = web3.eth.abi.encodeParameters(params, dataes);
    return `${selector}${payload.substr(2)}`;
}

async function defaultGasLimit(cntr: string, nonce: number, value: string, hexData: string) {
  const account = private2Account();
  const from = account.address;

  return await web3.eth.estimateGas({
    from,
    to: cntr,
    nonce,
    value,
    data: hexData
  });
}

function private2Account() {
  return web3.eth.accounts.privateKeyToAccount(privateKey);
}

async function defaultGasPrice() {
  return gasPrice === 0 ?
    Web3.utils.toHex(await web3.eth.getGasPrice()) :
    Web3.utils.toHex(parseInt(`${gasPrice}000000000`));
}

async function txnonce() {
  const account = private2Account();
  const pubkey = account.address
  return await web3.eth.getTransactionCount(pubkey);
}

async function send(): Promise<any> {
    //  获取nonce,使用本地私钥发送交易
    try {
    const data = serialize(fselector, fparams, fdata);
    const gasPrice = await defaultGasPrice();
    const nonce = await txnonce();
    const chainId = await web3.eth.net.getId();
    const value = valueToSend ? web3.utils.toHex(web3.utils.toWei(`${valueToSend}`, 'ether')) : '0x00';
    const gasLimit = Web3.utils.toHex(await defaultGasLimit(contract, nonce, value, data));

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
      to: contract,
      // 调用合约转账value这里留空
      value,
      data,
    };
    const etx = new EthereumTx(txParams);
    // 引入私钥，并转换为16进制
    const privateKeyHex = Buffer.from(privateKey.replace(/^0x/, ''), 'hex');
    // 用私钥签署交易
    etx.sign(privateKeyHex);
    // // 序列化
    const serializedTx = etx.serialize();
    const signedTxHex = `0x${serializedTx.toString('hex')}`;

    const receipt = await web3.eth.sendSignedTransaction(signedTxHex);
    return receipt;
  } catch(e: any) {
    throw new Error(e.message);
  }
}

async function main() {
  const retryTimes = getRetryTimes();

  let infiniteloop = retryTimes === 0;
  let triedTimesd = 0;

  while(infiniteloop || triedTimesd < retryTimes) {
    try {
      const receipt = await send();
      console.log('\nSUCCESS => ', receipt.transactionHash);
      return;
    } catch(e: any) {
      console.log('\nFAILED => ', e.message);
    }
    ++triedTimesd;
  }
}

main().catch(e => console.log(e.message));