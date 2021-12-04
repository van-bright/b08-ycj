#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const web3_1 = __importDefault(require("web3"));
commander_1.program
    .requiredOption('--sig <sig...>', 'to use latest version')
    .requiredOption('--data <data>', 'input data to decode');
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
const web3 = new web3_1.default("https://127.0.0.1");
function print(funcSig, params) {
    let output = [];
    const len = parseInt(params['__length__']) || 0;
    for (let i = 0; i < len; ++i) {
        output.push(` ${params[i.toString()]}`);
    }
    console.log(`${funcSig}  ${output}`);
}
function generate_abi_object(types) {
    return types;
}
function main(sig, data) {
    const abi = generate_abi_object(sig);
    const funcSig = data.substr(0, 10);
    const pureData = `0x${data.substr(10)}`;
    const params = web3.eth.abi.decodeParameters(abi, pureData);
    print(funcSig, params);
}
main(options.sig, options.data);
//# sourceMappingURL=ycj-decode.js.map