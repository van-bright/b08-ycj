#!/usr/bin/env node

import {program} from "commander";
import Web3 from "web3";

program
  .requiredOption('--sig <sig...>', 'to use latest version')
  .requiredOption('--data <data>', 'input data to decode');

program.parse(process.argv);

const options = program.opts();
const web3 = new Web3("https://127.0.0.1");

function print(funcSig: string, params: {[key: string]: string}) {
  let output: string[] = [];
  const len = parseInt(params['__length__']) || 0;
  for (let i = 0; i < len; ++i) {
    output.push(` ${params[i.toString()]}`);
  }
  console.log(`${funcSig}  ${output}`);
}

function generate_abi_object(types: string[]): any[] {
  return types;
}

function main(sig: string[], data: string) {
  const abi = generate_abi_object(sig);
  const funcSig = data.substr(0, 10);
  const pureData = `0x${data.substr(10)}`;

  const params = web3.eth.abi.decodeParameters(abi, pureData);
  print(funcSig, params);
}

main(options.sig, options.data);