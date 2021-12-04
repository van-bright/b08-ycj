#!/usr/bin/env node

import {program} from "commander";
import Web3 from "web3";
import fetch from 'cross-fetch';

program
  .requiredOption('--sig <sig...>', 'to use latest version')
  .requiredOption('--data <data>', 'input data to decode');

program.parse(process.argv);

const options = program.opts();
const web3 = new Web3("https://127.0.0.1");

// 尝试解码方法签名
// curl -X GET https://www.4byte.directory/api/v1/signatures/?hex_signature=0x372f657c
// {"count":1,"next":null,"previous":null,"results":[{"id":445487,"created_at":"2021-12-04T14:25:07.141219Z","text_signature":"whitelistMint(bytes32[])","hex_signature":"0x372f657c","bytes_signature":"7/e|"}]}

interface DictJson {
  count: number;
  next: any;
  previous: any;
  results: {
    id: number;
    created_at: string;
    text_signature: string;
    hex_signature: string;
    bytes_signature: string;
  }[]
}
async function try_parse_signature(hexSig: string) {
  const resp = await fetch(`https://www.4byte.directory/api/v1/signatures/?hex_signature=${hexSig}`);
  if (resp.status !== 200) return hexSig;

  const dict = await resp.json() as DictJson;
  if (dict.count === 0) return hexSig;

  return dict.results[0].text_signature;
}

function print(funcSig: string, params: {[key: string]: string}) {
  let output: string[] = [];
  const len = parseInt(params['__length__']) || 0;
  for (let i = 0; i < len; ++i) {
    output.push(` ${params[i.toString()]}`);
  }
  console.log(`\n${funcSig}  ${output}`);
}

function generate_abi_object(types: string[]): any[] {
  return types;
}

async function main(sig: string[], data: string) {
  const abi = generate_abi_object(sig);
  let funcSig = data.substr(0, 10);
  const pureData = `0x${data.substr(10)}`;

  const params = web3.eth.abi.decodeParameters(abi, pureData);
  funcSig = await try_parse_signature(funcSig);
  print(funcSig, params);
}

main(options.sig, options.data).catch(e => console.log(e));