#!/usr/bin/env node

import { program } from "commander";
import TxSender, { TxOption } from "./TxSender";

program
  .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic", 或者rpc地址')
  .option('--contract <contract>', '被调用的合约地址')
  .option('--method <method>', '合约方法签名, 如 transfer')
  .option('--data <data>', '合约方法的实际参数值, 如 --data ["0x2Bfexxx", "1000000"]')
  .option('--gas-price <gasPrice>', '调用合约使用的gas price, 单位为gwei. 默认使用推荐的gas费')
  .option('--gas-limit <gasLimit>', '使用的gas上限, 如不提供, 将使用预估的gas limit')
  .option('--private-key <privateKey>', '签名的私钥')
  .option('-s, --sign', '仅仅输出签名后的交易, 但是不发送')

program.addHelpText('after', `
  该命令支持ERC20规范的接口, 原型如下:

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(address sender,address recipient,uint256 amount) external returns (bool);
`);

program.parse(process.argv);

const options = program.opts();

async function callViewMethod(tx: TxOption) {
  try {
    const txSender = new TxSender(options.network);
    const s = await txSender.query(tx);
    console.log(s);
  } catch (e: any) {
    console.log('error: ', e);
    throw new Error(e);
  }
}

async function callMethod(tx: TxOption, hasData: boolean = true) {
  try {
    const txSender = new TxSender(options.network, options.privateKey);
    const signedHex = await txSender.sign(tx);
    if (options.sign) {
      console.log(signedHex);
    } else {
      const receipt = await txSender.send(signedHex);
      console.log(receipt.transactionHash);
    }
  } catch (e: any) {
    console.log('error: ', e);
    throw new Error(e);
  }
}

async function totalSupply() {
  const tx: TxOption = {
    to: options.contract,
    data: {
      method: "totalSupply"
    },
  };
  await callViewMethod(tx);
}

async function balanceOf() {
  const tx: TxOption = {
    to: options.contract,
    data: {
      method: "balanceOf",
      params: ["address"],
      args: JSON.parse(options.data),
    },
  };

  await callViewMethod(tx);
}

async function transfer() {
  if (!options.data) throw new Error('需要输入--data参数');
  const tx: TxOption = {
    to: options.contract,
    data: {
      method: "transfer",
      params: ["address", "uint256"],
      args: JSON.parse(options.data),
    },
    gasLimit: options.gasLimit,
    gasPrice: options.gasPrice
  };

  await callMethod(tx);
}

async function allowance() {
  if (!options.data) throw new Error('需要输入--data参数');

  const tx: TxOption = {
    to: options.contract,
    data: {
      method: "allowance",
      params: ["address", "address"],
      args: JSON.parse(options.data),
    },
    gasLimit: options.gasLimit,
    gasPrice: options.gasPrice
  };

  await callMethod(tx);
}

async function approve() {
  if (!options.data) throw new Error('需要输入--data参数');

  const tx: TxOption = {
    to: options.contract,
    data: {
      method: "approve",
      params: ["address", "uint256"],
      args: JSON.parse(options.data),
    },
    gasLimit: options.gasLimit,
    gasPrice: options.gasPrice
  };

  await callMethod(tx);
}

async function transferFrom() {
  if (!options.data) throw new Error('需要输入--data参数');

  const tx: TxOption = {
    to: options.contract,
    data: {
      method: "transferFrom",
      params: ["address", "address", "uint256"],
      args: JSON.parse(options.data),
    },
    gasLimit: options.gasLimit,
    gasPrice: options.gasPrice
  };

  await callMethod(tx);
}

const IERC20: { [k: string]: () => Promise<void> } = {
  'totalSupply': totalSupply,
  'balanceOf': balanceOf,
  'transfer': transfer,
  'allowance': allowance,
  'approve': approve,
  'transferFrom': transferFrom
};

async function main() {
  const f = IERC20[options.method];
  if (!f) {
    throw new Error('only support methods: ' + Object.keys(IERC20));
  }

  await f();
}

main().catch(e => console.log(e.message));