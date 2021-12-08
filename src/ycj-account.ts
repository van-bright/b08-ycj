#!/usr/bin/env node

import {program} from "commander";
import Web3 from "web3";

program
  .option('-c, --count <count>', '生成账号数量', '1')

program.parse(process.argv);

const options = program.opts();

const count = parseInt(options.count) || 1;


const web3 = new Web3("http://127.0.0.1");

async function main() {
  for (let i = 0; i < count; i++) {
    const acc = web3.eth.accounts.create();
    console.log(`"${acc.address}": "${acc.privateKey}"`);
  }
}

main().catch(e => console.log(e.message));