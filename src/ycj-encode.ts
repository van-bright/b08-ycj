#!/usr/bin/env node

import {program} from "commander";
import Web3 from "web3";

program
  .requiredOption('--sig <sigs...>', 'type to encode')
  .requiredOption('--data <data...>', 'data to encode');

program.parse(process.argv);

const options = program.opts();
const web3 = new Web3("https://127.0.0.1");

function main(sigs: string[], data: string[]) {

  const params = web3.eth.abi.encodeParameters(sigs, data);
  // console.log(`${sigs} ${data} => ${params.startsWith('0x') ? params.length - 2 : params.length}`);
  console.log(`\t${params}`);
}

main(options.sigs, options.data);
