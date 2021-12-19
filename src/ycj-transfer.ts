#!/usr/bin/env node

import { program } from "commander";

import { networks } from "./networks";
import TxSender from "./tx-sender";
import Web3 from "web3";
var EthereumTx = require('ethereumjs-tx');

program.command('local').description("转账链的原生代币")
  .requiredOption('--network <network>', '区块链网络的RPC')
  .requiredOption('--private-key <privateKey>', '签名的私钥')
  .option('--to <to...>', '接收账号列表')
  .option('--amount <amount...>', '对应每个接收账号的接收的代币数量, 单位为 ether')
  .option('--json <json>', '使用json文件列举转账信息, 如{"0x123456": "10000000", ...}')
  .action(transferLocalValue);


program.parse(process.argv);

interface TransferInfo {
  network: string;
  to: string[];
  amount: string[];
  privateKey: string;
}


function parseOptions(options: any) {
  const network = options.network;
  const contract = options.contract;
  const recepients = options.to;
  const amounts = options.amount;
  const jsonFile = options.json;

  const privateKey = options.privateKey;


  if (!networks[network]) {
    console.log(`unsupport network ${network}`);
    process.exit(1);
  }

  let transInfo: TransferInfo = {
    network: networks[network],
    privateKey,
    to: [],
    amount: [],
  }

  if (jsonFile) {
    let recepientInfo = require(jsonFile);
    let recepients = Object.keys(recepientInfo);
    for (let r of recepients) {
      transInfo.to.push(r);
      transInfo.amount.push(recepientInfo[r]);
    }
  } else if (recepients && amounts) {
    if (recepients.length != amounts.length) {
      console.log('--to 和 --amount的参数个数不一致');
      process.exit(1);
    }

    transInfo.to = recepients;
    transInfo.amount = amounts;
  } else {
    console.log(`需要使用--json方式, 或者--to 0x123  --amount 123 的方式指定接收人和接收数量`);
    process.exit(1);
  }

  return transInfo;
}

async function defaultGasLimit() {
  return '3000000';
}

function private2Account(web3: Web3, privateKey: string) {
  return web3.eth.accounts.privateKeyToAccount(privateKey).address;
}

async function defaultGasPrice(web3: Web3) {
  return Web3.utils.toHex(await web3.eth.getGasPrice());
}

async function txnonce(web3: Web3, pubkey: string) {
  return await web3.eth.getTransactionCount(pubkey);
}

async function send(transInfo: TransferInfo): Promise<any> {
  //  获取nonce,使用本地私钥发送交易
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(transInfo.network));
    const pubkey = private2Account(web3, transInfo.privateKey)
    const gasPrice = await defaultGasPrice(web3);
    const chainId = await web3.eth.net.getId();
    const gasLimit = Web3.utils.toHex(await defaultGasLimit());

    for (let i = 0; i < transInfo.to.length; i++) {
      const nonce = await txnonce(web3, pubkey);
      const value = web3.utils.toHex(web3.utils.toWei(`${transInfo.amount[i]}`, 'ether'));

      const txParams: any = {
        from: pubkey,
        to: transInfo.to[i],
        chainId,
        nonce: Web3.utils.toHex(nonce),
        gasPrice,
        gasLimit,
        // 调用合约转账value这里留空
        value,
      };
      const etx = new EthereumTx(txParams);
      // 引入私钥，并转换为16进制
      const privateKeyHex = Buffer.from(transInfo.privateKey.replace(/^0x/, ''), 'hex');
      // 用私钥签署交易
      etx.sign(privateKeyHex);
      // // 序列化
      const serializedTx = etx.serialize();
      const signedTxHex = `0x${serializedTx.toString('hex')}`;

      const receipt = await web3.eth.sendSignedTransaction(signedTxHex);
      console.log(`SUCCESS => ${transInfo.to[i]} : ${transInfo.amount[i]}  ${receipt.transactionHash}}`);
    }
  } catch (e: any) {
    throw new Error(e.message);
  }
}


async function transferLocalValue(options: any) {
  // console.log('call local: ', options)
  try {
    let opt = parseOptions(options);
    await send(opt);
  } catch (e: any) {
    console.log('错误: ' + e.message);
  }

}
