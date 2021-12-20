#!/usr/bin/env node

import {program} from "commander";
import Web3 from "web3";
import fetch from 'cross-fetch';

import {networks} from "./networks";

program
  .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic"')
  .requiredOption('--contract <contract>', '被调用的合约地址')
  .requiredOption('--sig <sig>', '合约方法签名, 如果知道abi, 填func(uint)格式, 否则填0x12345678格式的方法签名')
  .option('--params <params...>', '合约方法的参数类型列表, 如 --params uint256 uint256 address')
  .option('--data <data...>', '合约方法的实际参数值, 和--params中提供的参数一一对应')

program.parse(process.argv);

const options = program.opts();

const network = options.network;
const contract = options.contract;
const fselector = options.sig;
const fparams = options.params || [];
const fdata = options.data || [];

if (!networks[network] ) throw new Error(`unknow network "${network}"`);

const web3 = new Web3(networks[network]);

function serialize(sig: string, params: string[], dataes: string[]): string {
    const selector = sig.startsWith('0x') ? sig : web3.eth.abi.encodeFunctionSignature(sig);
    const payload = web3.eth.abi.encodeParameters(params, dataes);
    return `${selector}${payload.substr(2)}`;
}


async function send(): Promise<any> {
    try {
    const data = serialize(fselector, fparams, fdata);
    const req = {
      "method": "eth_call",
      "params": [
        {
          "to": contract,
          "data": data,
        },
        "latest"
      ],
      "id": 666,
      "jsonrpc": "2.0"
    }

    const rsp = await fetch(networks[network], {
      body: JSON.stringify(req),
      headers: {"Content-Type": "application/json"},
      method: "POST"
    });

    if (rsp.status === 200) {
      return (await rsp.json()).result;
    }

    throw new Error(`Error: status = ${rsp.status}, ${rsp.statusText}`);
  } catch(e: any) {
    throw new Error(e.message);
  }
}

async function main() {
  const data = await send();
  console.log(data);
}

main().catch(e => console.log(e.message));