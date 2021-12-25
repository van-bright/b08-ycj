#!/usr/bin/env node

import { program } from "commander";
import TxSender, { TxOption } from "./TxSender";

program
  .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic", 或者rpc地址')
  .option('--balance <balance>', '查询账号的账户余额')
  .option('--contract <contract>', '被调用的合约地址')
  .option('--method <method>', '需要调用的方法名字, 如 --method balanceOf')
  .option('--params <params>', '合约方法的参数类型列表, 如 --params ["address"]')
  .option('--data <data>', '合约方法的实际参数值, 和--params中提供的参数一一对应, 如 --data ["0x2bFexeaaaaaaa"]')

program.parse(process.argv);

const options = program.opts();

const network = options.network;
const contract = options.contract;
const fselector = options.method;
const fparams = options.params;
const fdata = options.data;
const queryBalance = options.balance;

async function send(): Promise<any> {
  try {
    const txSender = new TxSender(network);
    if (queryBalance) {
      return await txSender.getBalance(queryBalance);
    } else {
      const tx: TxOption = {
        to: contract,
        data: {
          method: fselector,
          params: fparams ? JSON.parse(fparams) : fparams,
          args: fdata ? JSON.parse(fdata) : fdata,
        }
      }

      return await txSender.query(tx);
    }
  } catch (e: any) {
    throw new Error(e.message);
  }
}

async function main() {
  const data = await send();
  console.log(data);
}

main().catch(e => console.log(e.message));