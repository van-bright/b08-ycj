#!/usr/bin/env node

import {program} from "commander";
import Web3 from "web3";

program
  .option('-c, --count <count>', '生成账号数量, 默认数量为1.  生成结果一个数组: [{"address": "0xabc", "privateKey": "0xabcdef"}, ....]', '1')
  .option('-y, --yaml', '使用私钥, 生成yaml格式的列表,形如 - "0xabcedf"', false)
  .option('-t, --transfer', '生成ycj transfer命令需要的json格式信息: {"0xabc": "1.0", "0xabcef": "1.0", ....} ', false)

program.parse(process.argv);

const options = program.opts();

const count = parseInt(options.count) || 1;


const web3 = new Web3("http://127.0.0.1");

interface GenKeyPair {
  address: string;
  privateKey: string;
}

async function main() {
  let accounts:GenKeyPair[] = [];
  for (let i = 0; i < count; i++) {
    const { address, privateKey } = web3.eth.accounts.create();
    accounts.push({
      address: address.toLowerCase(),
      privateKey,
    });
  }

  console.log(`${JSON.stringify(accounts, null, 2)}`);

  if (options.yaml) {
    console.log('\n');
    for (let a of accounts) {
      console.log(`- "${a.privateKey}"`);
    }
  }

  if (options.transfer) {
    let t: {[key: string]: string} = {}
    for (let a of accounts) {
      t[a.address] = "1.0";
    }
    console.log(`\n${JSON.stringify(t, null, 2)}`);
  }
}

main().catch(e => console.log(e.message));