#!/usr/bin/env node

import { program } from "commander";
import TxSender, { TxOption } from "./TxSender";

program
  .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic"')
  .option('--raw <raw>', '发送一个已经签名的交易')
  .option('--contract <contract>', '被调用的合约地址')
  .option('--method <method>', '合约方法签名, 如 transfer')
  .option('--params <params>', '合约方法的参数类型列表, 如 --params ["address","uint256"]')
  .option('--data <data>', '合约方法的实际参数值, 和--params中提供的参数一一对应, 如 --data ["0x2Bfexxx", "1000000"]')
  .option('--gas-price <gasPrice>', '调用合约使用的gas price, 单位为gwei. 默认使用推荐的gas费')
  .option('--gas-limit <gasLimit>', '使用的gas上限, 如不提供, 将使用预估的gas limit')
  .option('--retry <retry>', '重试次数, 默认为1, 即不重试, 发出交易就可以. 0 表示无限次重试, 直到返回成功.')
  .option('--private-key <privateKey>', '签名的私钥')
  .option('--value <value>', '调用时发送的value, 单位为ethers. 默认值为0')

program.parse(process.argv);

const options = program.opts();

function getRetryTimes() {
  const t = parseInt(options.retry);
  if (!t && t !== 0) return 1;
  else return t;
}

async function send(): Promise<any> {
  try {
    const txSender = new TxSender(options.network, options.privateKey);
    let receipt;
    if (options.raw) {
      receipt = await txSender.send(options.raw);
    } else {
      const tx: TxOption = {
        to: options.contract,
        data: {
          method: options.method,
          params: options.params,
          args: options.data
        },
        gasLimit: options.gasLimit,
        gasPrice: options.gasPrice,
        value: options.value
      };
      const signedTxHex = await txSender.sign(tx);
      receipt = await txSender.send(signedTxHex);
    }
    return receipt.transactionHash;
  } catch (e: any) {
    console.log('error: ', e);
    throw new Error(e);
  }
}

async function main() {
  const retryTimes = getRetryTimes();

  let infiniteloop = retryTimes === 0;
  let triedTimesd = 0;

  while (infiniteloop || triedTimesd < retryTimes) {
    try {
      const receipt = await send();
      console.log('\nSUCCESS => ', receipt);
      return;
    } catch (e: any) {
      console.log('\nFAILED => ', e.message);
    }
    ++triedTimesd;
  }
}

main().catch(e => console.log(e.message));