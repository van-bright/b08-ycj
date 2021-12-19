#!/usr/bin/env node

import {program} from "commander";
import Web3 from "web3";

program
  .option('--sig <sigs...>', 'type to encode')
  .option('--data <data...>', 'data to encode')
  .option('-f, --func', "encode function signature")
  .option('-e, --event', "encode event signature");


program.parse(process.argv);

const options = program.opts();
const web3 = new Web3("https://127.0.0.1");

function main() {

  if (options.func) {
    const fsig = web3.eth.abi.encodeFunctionSignature(options.data[0]);
    console.log(fsig);
  } else if (options.event) {
    const esig = web3.eth.abi.encodeEventSignature(options.data[0]);
    console.log(esig);
  } else {
    const params = web3.eth.abi.encodeParameters(options.sigs, options.data);
    // console.log(`${sigs} ${data} => ${params.startsWith('0x') ? params.length - 2 : params.length}`);
    console.log(`\t${params}`);
  }
}

main();
