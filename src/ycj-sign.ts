#!/usr/bin/env node

import {program} from "commander";

import TxSender, { TxOption } from "./TxSender";

program
  .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic", 或者rpc的地址如 https://example.com')
  .requiredOption('--private-key <privateKey>', '签名的私钥')
  .option('--tx <tx>', '需要签名的交易信息')

program.parse(process.argv);

const options = program.opts();

const network = options.network;
const privateKey = options.privateKey;
const txOption = JSON.parse(options.tx) as TxOption;

async function main() {
  const txSender = new TxSender(network, privateKey);
  const signedTxHex = await txSender.sign(txOption);
  console.log(`\n${signedTxHex}`);
}

main().catch(e => console.log(e.message));