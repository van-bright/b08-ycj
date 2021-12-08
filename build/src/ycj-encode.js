#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const web3_1 = __importDefault(require("web3"));
commander_1.program
    .requiredOption('--sig <sigs...>', 'type to encode')
    .requiredOption('--data <data...>', 'data to encode');
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
const web3 = new web3_1.default("https://127.0.0.1");
function main(sigs, data) {
    const params = web3.eth.abi.encodeParameters(sigs, data);
    // console.log(`${sigs} ${data} => ${params.startsWith('0x') ? params.length - 2 : params.length}`);
    console.log(`\t${params}`);
}
main(options.sigs, options.data);
//# sourceMappingURL=ycj-encode.js.map