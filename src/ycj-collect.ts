#!/usr/bin/env node

import { program } from "commander";

import { networks } from "./networks";
import Web3 from "web3";
import delay from "delay";
var EthereumTx = require('ethereumjs-tx');

program.description("将账号中的币, 归集到指定账号中")
  .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic", 或者rpc地址, 如 http://example.com')
  .requiredOption('--to <to>', '接收账号列表, 如 --to 0xabc1')
  .requiredOption('--json <json>', '使用json文件列举转账信息, 如内容 [0xpk1,0xpk2, 0xpk3....]')
  .option('-p,--print', '仅仅打印而不执行转账操作')

program.parse(process.argv);

const options = program.opts();

async function defaultGasLimit() {
  return '21000';
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

async function main() {
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(networks[options.network] || options.network));
    const toBN = web3.utils.toBN;
    const chainId = await web3.eth.net.getId();
    const gasLimit = Web3.utils.toHex(await defaultGasLimit());
    const gasPrice = await defaultGasPrice(web3);

    const accounts = require(options.json);

    for (let account of accounts) {
      const pubkey = private2Account(web3, account)
      let balance = toBN(await web3.eth.getBalance(pubkey));

      if (options.print) {
        console.log(`${account} => ${balance}`);
        continue;
      }

      if (balance.isZero()) {
        console.log(`${account} : ${pubkey} => ${balance}`);
        continue;
      }

      const limit = toBN(await defaultGasLimit());
      const subv = limit.mul(toBN(gasPrice));
      // console.log('subv: ', subv.toString(10))
      let v = balance.sub(subv)
      // console.log('left v: ', v.toString(10))

      const nonce = await txnonce(web3, pubkey);
      const value = web3.utils.toHex(web3.utils.toWei(`${v}`, 'wei'));

      const txParams: any = {
        from: pubkey,
        to: options.to,
        chainId,
        nonce: Web3.utils.toHex(nonce),
        gasPrice,
        gasLimit,
        // 调用合约转账value这里留空
        value,
      };

      const etx = new EthereumTx(txParams);
      // 引入私钥，并转换为16进制
      const privateKeyHex = Buffer.from(account.replace(/^0x/, ''), 'hex');
      // 用私钥签署交易
      etx.sign(privateKeyHex);
      // // 序列化
      const serializedTx = etx.serialize();
      const signedTxHex = `0x${serializedTx.toString('hex')}`;

      const receipt = await web3.eth.sendSignedTransaction(signedTxHex);
      console.log(`from ${account} to ${options.to} with ${balance.toString(10)} => ${receipt.transactionHash}`);
    }
  } catch (e: any) {
    throw new Error(e.message);
  }
}

main();


