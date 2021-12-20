#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const web3_1 = __importDefault(require("web3"));
commander_1.program
    .option('--sig <sig...>', '需要编码的类型, 如 --sig uint256 address')
    .option('--data <data...>', '实际编码的数据, 如 --data 1 0xabcedfg')
    .option('-f, --func', "获得--data提供的方法字面量的selector, 如 --data 'myfun(uint256)' -f")
    .option('-e, --event', "获得--data提供的Event字面量的签名, 如 --data 'myevent(uint256,address) -e");
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
const web3 = new web3_1.default("https://127.0.0.1");
function main() {
    if (options.func) {
        const fsig = web3.eth.abi.encodeFunctionSignature(options.data[0]);
        console.log(fsig);
    }
    else if (options.event) {
        const esig = web3.eth.abi.encodeEventSignature(options.data[0]);
        console.log(esig);
    }
    else {
        const params = web3.eth.abi.encodeParameters(options.sig, options.data);
        // console.log(`${sigs} ${data} => ${params.startsWith('0x') ? params.length - 2 : params.length}`);
        console.log(`\t${params}`);
    }
}
main();
//# sourceMappingURL=ycj-encode.js.map