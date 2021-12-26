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
commander_1.program.description("从签名私钥的账号中, 转账链的原生代币")
    .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic", 或者rpc地址, 如 http://example.com')
    .requiredOption('--private-key <privateKey>', '签名的私钥')
    .option('--to <to...>', '接收账号列表, 如 --to 0xabc1 0xabc2')
    .option('--amount <amount...>', '对应每个接收账号的接收的代币数量, 单位为 ether. 如 --amount "1.0" "0.8"')
    .option('--json <json>', '使用json文件列举转账信息, 如{"0xabc1": "1.0", "0xabc2": "0.8", ...}')
    .option('--gas-price <gasprice>', '设置gasPrice, 单位为 gwei')
    .option('-s,--sign', "仅输出签名后交易, 但是不发送");
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
function parseOptions() {
    const network = options.network;
    const recepients = options.to;
    const amounts = options.amount;
    const jsonFile = options.json;
    const privateKey = options.privateKey;
    let transInfo = {
        network,
        privateKey,
        to: [],
        amount: [],
        gasPrice: options.gasprice
    };
    if (jsonFile) {
        let recepientInfo = require(jsonFile);
        let recepients = Object.keys(recepientInfo);
        for (let r of recepients) {
            transInfo.to.push(r);
            transInfo.amount.push(recepientInfo[r]);
        }
    }
    else if (recepients && amounts) {
        if (recepients.length != amounts.length) {
            console.log('--to 和 --amount的参数个数不一致');
            process.exit(1);
        }
        transInfo.to = recepients;
        transInfo.amount = amounts;
    }
    else {
        console.log(`需要使用--json方式, 或者--to 0x123  --amount 123 的方式指定接收人和接收数量`);
        process.exit(1);
    }
    return transInfo;
}
function send(transInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const txSender = new TxSender_1.default(transInfo.network, transInfo.privateKey);
            for (let i = 0; i < transInfo.to.length; i++) {
                const tx = {
                    from: txSender.getPubkey(),
                    to: transInfo.to[i],
                    value: transInfo.amount[i],
                    gasLimit: '21000',
                    gasPrice: transInfo.gasPrice
                };
                const signedTxHex = yield txSender.sign(tx);
                if (options.sign) {
                    console.log(`\n${signedTxHex}`);
                }
                else {
                    const receipt = yield txSender.send(signedTxHex);
                    console.log(`SUCCESS => ${transInfo.to[i]} : ${transInfo.amount[i]}  ${receipt.transactionHash}}`);
                }
            }
        }
        catch (e) {
            throw new Error(e.message);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let opt = parseOptions();
            yield send(opt);
        }
        catch (e) {
            console.log('错误: ' + e.message);
        }
    });
}
main();
//# sourceMappingURL=ycj-transfer.js.map