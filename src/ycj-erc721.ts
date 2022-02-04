#!/usr/bin/env node

import { program } from "commander";
import Web3 from "web3";
import {Hex} from "web3-utils";

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
  用法示例:
  $ ycj erc721 --network matic --contract 0xd50d167dd35d256e19e2fb76d6b9bf9f4c571a3e --method balanceOf --data '["0x18d3c20a79fbceb89fa1dad8831dcf6ebbe27491"]'


  该命令支持ERC721规范的接口, 各方法的原型如下:

  function balanceOf(address owner) external view returns (uint256 balance);

  function ownerOf(uint256 tokenId) external view returns (address owner);

  function safeTransferFrom(address from, address to, uint256 tokenId) external;

  function transferFrom(address from, address to, uint256 tokenId) external;

  function approve(address to, uint256 tokenId) external;

  function getApproved(uint256 tokenId) external view returns (address operator);

  function setApprovalForAll(address operator, bool _approved) external;

  function isApprovedForAll(address owner, address operator) external view returns (bool);

`);

program.parse(process.argv);

const options = program.opts();

async function callViewMethod(tx: TxOption) {
  try {
    const txSender = new TxSender(options.network);
    const s = await txSender.query(tx);
    return s;
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

async function balanceOf() {
  const tx: TxOption = {
    to: options.contract,
    data: {
      method: "balanceOf",
      params: ["address"],
      args: JSON.parse(options.data),
    },
  };

  let r: Hex = await callViewMethod(tx);
  let v = Web3.utils.toBN(r).toString(10);
  console.log(v);
}

async function ownerOf() {
  const tx: TxOption = {
    to: options.contract,
    data: {
      method: "ownerOf",
      params: ["uint256"],
      args: JSON.parse(options.data),
    },
  };

  let r = await callViewMethod(tx);
  let v = TxSender.decode("address", r);
  console.log(v);
}


async function safeTransferFrom() {
  const tx: TxOption = {
    to: options.contract,
    data: {
      method: "safeTransferFrom",
      params: ["address", "address", "uint256"],
      args: JSON.parse(options.data),
    },
    gasLimit: options.gasLimit,
    gasPrice: options.gasPrice
  };

  await callMethod(tx);
}


async function transferFrom() {
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

async function approve() {
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


async function getApproved() {
  const tx: TxOption = {
    to: options.contract,
    data: {
      method: "getApproved",
      params: ["uint256"],
      args: JSON.parse(options.data),
    },
  };

  let r = await callViewMethod(tx);
  let v = Web3.utils.toBN(r).isZero();

  console.log(!v);
}

async function setApprovalForAll() {
  const tx: TxOption = {
    to: options.contract,
    data: {
      method: "setApprovalForAll",
      params: ["address", "bool"],
      args: JSON.parse(options.data),
    },
    gasLimit: options.gasLimit,
    gasPrice: options.gasPrice
  };

  await callMethod(tx);
}

async function isApprovedForAll() {
  const tx: TxOption = {
    to: options.contract,
    data: {
      method: "isApprovedForAll",
      params: ["address", "address"],
      args: JSON.parse(options.data),
    },
  };

  let r = await callViewMethod(tx);
  let v = Web3.utils.toBN(r).isZero();
  console.log(!v);
}

const IERC721: { [k: string]: () => Promise<void> } = {
  'balanceOf': balanceOf,
  'ownerOf': ownerOf,
  'setApprovalForAll': setApprovalForAll,
  'isApprovedForAll': isApprovedForAll,
  'approve': approve,
  'getApproved': getApproved,
  'transferFrom': transferFrom,
  'safeTransferFrom': safeTransferFrom,
};

async function main() {
  const f = IERC721[options.method];
  if (!f) {
    throw new Error('only support methods: ' + Object.keys(IERC721));
  }

  await f();
}

main().catch(e => console.log(e.message));