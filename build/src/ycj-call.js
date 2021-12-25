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
    .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic"')
    .option('--raw <raw>', '发送一个已经签名的交易')
    .option('--contract <contract>', '被调用的合约地址')
    .option('--method <method>', '合约方法签名, 如 transfer')
    .option('--params <params>', '合约方法的参数类型列表, 如 --params ["address","uint256"]')
    .option('--data <data>', '合约方法的实际参数值, 和--params中提供的参数一一对应, 如 --data ["0x2Bfexxx", "1000000"]')
    .option('--gas-price <gasPrice>', '调用合约使用的gas price, 单位为gwei. 默认使用推荐的gas费')
    .option('--gas-limit <gasLimit>', '使用的gas上限, 如不提供, 将使用预估的gas limit')
    .option('--retry <retry>', '重试次数, 默认为1, 即不重试, 发出交易就可以. 0 表示无限次重试, 直到返回成功.')
    .option('--private-key <privateKey>', '签名的私钥')
    .option('--value <value>', '调用时发送的value, 单位为ethers. 默认值为0');
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
function getRetryTimes() {
    const t = parseInt(options.retry);
    if (!t && t !== 0)
        return 1;
    else
        return t;
}
function send() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const txSender = new TxSender_1.default(options.network, options.privateKey);
            let receipt;
            if (options.raw) {
                receipt = yield txSender.send(options.raw);
            }
            else {
                const tx = {
                    to: options.contract,
                    data: {
                        method: options.method,
                        params: options.params,
                        args: options.data
                    },
                    gasLimit: options.gasLimit,
                    gasPrice: options.gasPrice,
                    value: options.value
                };
                const signedTxHex = yield txSender.sign(tx);
                receipt = yield txSender.send(signedTxHex);
            }
            return receipt.transactionHash;
        }
        catch (e) {
            console.log('error: ', e);
            throw new Error(e);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const retryTimes = getRetryTimes();
        let infiniteloop = retryTimes === 0;
        let triedTimesd = 0;
        while (infiniteloop || triedTimesd < retryTimes) {
            try {
                const receipt = yield send();
                console.log('\nSUCCESS => ', receipt);
                return;
            }
            catch (e) {
                console.log('\nFAILED => ', e.message);
            }
            ++triedTimesd;
        }
    });
}
main().catch(e => console.log(e.message));
//# sourceMappingURL=ycj-call.js.map