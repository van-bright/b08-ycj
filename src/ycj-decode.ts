#!/usr/bin/env node

import {program} from "commander";
import Web3 from "web3";
import fetch from 'cross-fetch';

program
.requiredOption('--data <data>', '需要被解码的hex编码数据字符串')
.option('--sig <sig...>', '需要解码的参数类型列表, 如uint256, address等')
.option('-s, --simple', '简单模式, 即--data中提供的数据, 没有function selector.')
.option('-a, --ascii', '将--data中提供的数据, 按bytes编码的方式, 解析成ascii字符')

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

async function main(sig: string[], data: string, isSimple: boolean) {
  if (options.ascii) {
    const out = web3.utils.hexToAscii(data);
    console.log(out);
    return;
  }

  let abi: any[] = [];
  if (isSimple) {
    abi = generate_abi_object(sig);
    const params = web3.eth.abi.decodeParameters(abi, data);
    print("", params);
  } else {
    let funcSig = data.substr(0, 10);
    const decodeFuncSig = await try_parse_signature(funcSig);
    // let abi;
    // if (funcSig !== decodeFuncSig) {
    //   let r = /\((.+)\)/g
    //   let a = decodeFuncSig.match(r);
    //   let sa = RegExp.$1;
    //   abi = sa.split(',')
    // } else {
    // abi = generate_abi_object(sig);
    // }

    if (sig) abi = generate_abi_object(sig)

    const pureData = `0x${data.substr(10)}`;
    const params = web3.eth.abi.decodeParameters(abi, pureData);

    print(decodeFuncSig, params);

  }
}

main(options.sig, options.data, options.simple).catch(e => console.log(e));