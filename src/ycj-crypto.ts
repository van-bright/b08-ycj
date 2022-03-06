#!/usr/bin/env node

import {program} from "commander";
import Web3 from "web3";
import fetch from 'cross-fetch';

program
.option('--pub <pub>', '从私钥导出公钥地址')

program.parse(process.argv);

const options = program.opts();
const web3 = new Web3("https://127.0.0.1");

async function main(sig: string[], data: string, isSimple: boolean) {
  if (options.pub) {
    const r = web3.eth.accounts.privateKeyToAccount(options.pub)
    console.log(r.address);
  }
}

main(options.sig, options.data, options.simple).catch(e => console.log(e));