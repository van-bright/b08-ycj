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
const networks_1 = require("./networks");
const web3_1 = __importDefault(require("web3"));
var EthereumTx = require('ethereumjs-tx');
commander_1.program.description("将账号中的币, 归集到指定账号中")
    .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic", 或者rpc地址, 如 http://example.com')
    .requiredOption('--to <to>', '接收账号列表, 如 --to 0xabc1')
    .requiredOption('--json <json>', '使用json文件列举转账信息, 如内容 [0xpk1,0xpk2, 0xpk3....]')
    .option('-p,--print', '仅仅打印而不执行转账操作');
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
function defaultGasLimit() {
    return __awaiter(this, void 0, void 0, function* () {
        return '21000';
    });
}
function private2Account(web3, privateKey) {
    return web3.eth.accounts.privateKeyToAccount(privateKey).address;
}
function defaultGasPrice(web3) {
    return __awaiter(this, void 0, void 0, function* () {
        return web3_1.default.utils.toHex(yield web3.eth.getGasPrice());
    });
}
function txnonce(web3, pubkey) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield web3.eth.getTransactionCount(pubkey);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(networks_1.networks[options.network] || options.network));
            const toBN = web3.utils.toBN;
            const chainId = yield web3.eth.net.getId();
            const gasLimit = web3_1.default.utils.toHex(yield defaultGasLimit());
            const gasPrice = yield defaultGasPrice(web3);
            const accounts = require(options.json);
            for (let account of accounts) {
                const pubkey = private2Account(web3, account);
                let balance = toBN(yield web3.eth.getBalance(pubkey));
                if (options.print) {
                    console.log(`${account} => ${balance}`);
                    continue;
                }
                if (balance.isZero()) {
                    console.log(`${account} : ${pubkey} => ${balance}`);
                    continue;
                }
                const limit = toBN(yield defaultGasLimit());
                const subv = limit.mul(toBN(gasPrice));
                // console.log('subv: ', subv.toString(10))
                let v = balance.sub(subv);
                // console.log('left v: ', v.toString(10))
                const nonce = yield txnonce(web3, pubkey);
                const value = web3.utils.toHex(web3.utils.toWei(`${v}`, 'wei'));
                const txParams = {
                    from: pubkey,
                    to: options.to,
                    chainId,
                    nonce: web3_1.default.utils.toHex(nonce),
                    gasPrice,
                    gasLimit,
                    // 调用合约转账value这里留空
                    value,
                };
                const etx = new EthereumTx(txParams);
                // 引入私钥，并转换为16进制
                const privateKeyHex = Buffer.from(account.replace(/^0x/, ''), 'hex');
                // 用私钥签署交易
                etx.sign(privateKeyHex);
                // // 序列化
                const serializedTx = etx.serialize();
                const signedTxHex = `0x${serializedTx.toString('hex')}`;
                const receipt = yield web3.eth.sendSignedTransaction(signedTxHex);
                console.log(`from ${account} to ${options.to} with ${balance.toString(10)} => ${receipt.transactionHash}`);
            }
        }
        catch (e) {
            throw new Error(e.message);
        }
    });
}
main();
//# sourceMappingURL=ycj-collect.js.map