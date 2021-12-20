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
const web3_1 = __importDefault(require("web3"));
commander_1.program
    .option('-c, --count <count>', '生成账号数量, 默认数量为1.  生成结果一个数组: [{"address": "0xabc", "privateKey": "0xabcdef"}, ....]', '1')
    .option('-y, --yaml', '使用私钥, 生成yaml格式的列表,形如 - "0xabcedf"', false)
    .option('-t, --transfer', '生成ycj transfer命令需要的json格式信息: {"0xabc": "1.0", "0xabcef": "1.0", ....} ', false);
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
const count = parseInt(options.count) || 1;
const web3 = new web3_1.default("http://127.0.0.1");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let accounts = [];
        for (let i = 0; i < count; i++) {
            const { address, privateKey } = web3.eth.accounts.create();
            accounts.push({
                address: address.toLowerCase(),
                privateKey,
            });
        }
        console.log(`${JSON.stringify(accounts, null, 2)}`);
        if (options.yaml) {
            console.log('\n');
            for (let a of accounts) {
                console.log(`- "${a.privateKey}"`);
            }
        }
        if (options.transfer) {
            let t = {};
            for (let a of accounts) {
                t[a.address] = "1.0";
            }
            console.log(`\n${JSON.stringify(t, null, 2)}`);
        }
    });
}
main().catch(e => console.log(e.message));
//# sourceMappingURL=ycj-account.js.map