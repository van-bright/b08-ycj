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
    .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic", 或者rpc地址')
    .option('--balance <balance>', '查询账号的账户余额')
    .option('--contract <contract>', '被调用的合约地址')
    .option('--method <method>', '需要调用的方法名字, 如 --method balanceOf')
    .option('--params <params>', '合约方法的参数类型列表, 如 --params ["address"]')
    .option('--data <data>', '合约方法的实际参数值, 和--params中提供的参数一一对应, 如 --data ["0x2bFexeaaaaaaa"]');
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
const network = options.network;
const contract = options.contract;
const fselector = options.method;
const fparams = options.params;
const fdata = options.data;
const queryBalance = options.balance;
function send() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const txSender = new TxSender_1.default(network);
            if (queryBalance) {
                return yield txSender.getBalance(queryBalance);
            }
            else {
                const tx = {
                    to: contract,
                    data: {
                        method: fselector,
                        params: fparams ? JSON.parse(fparams) : fparams,
                        args: fdata ? JSON.parse(fdata) : fdata,
                    }
                };
                return yield txSender.query(tx);
            }
        }
        catch (e) {
            throw new Error(e.message);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield send();
        console.log(data);
    });
}
main().catch(e => console.log(e.message));
//# sourceMappingURL=ycj-get.js.map