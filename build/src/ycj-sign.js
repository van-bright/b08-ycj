#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const TxSender_1 = __importDefault(require("./TxSender"));
commander_1.program
    .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic", 或者rpc的地址如 https://example.com')
    .requiredOption('--private-key <privateKey>', '签名的私钥')
    .option('--tx <tx>', '需要签名的交易信息');
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
const network = options.network;
const privateKey = options.privateKey;
const txOption = JSON.parse(options.tx);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const txSender = new TxSender_1.default(network, privateKey);
        const signedTxHex = yield txSender.sign(txOption);
        console.log(`\n${signedTxHex}`);
    });
}
main().catch(e => console.log(e.message));
//# sourceMappingURL=ycj-sign.js.map