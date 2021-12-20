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
commander_1.program.command('native').description("从签名私钥的账号中, 转账链的原生代币")
    .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic"')
    .requiredOption('--private-key <privateKey>', '签名的私钥')
    .option('--to <to...>', '接收账号列表, 如 --to 0xabc1 0xabc2')
    .option('--amount <amount...>', '对应每个接收账号的接收的代币数量, 单位为 ether. 如 --amount "1.0" "0.8"')
    .option('--json <json>', '使用json文件列举转账信息, 如{"0xabc1": "1.0", "0xabc2": "0.8", ...}')
    .action(transferLocalValue);
commander_1.program.parse(process.argv);
function parseOptions(options) {
    const network = options.network;
    const contract = options.contract;
    const recepients = options.to;
    const amounts = options.amount;
    const jsonFile = options.json;
    const privateKey = options.privateKey;
    if (!networks_1.networks[network]) {
        console.log(`unsupport network ${network}`);
        process.exit(1);
    }
    let transInfo = {
        network: networks_1.networks[network],
        privateKey,
        to: [],
        amount: [],
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
function defaultGasLimit() {
    return __awaiter(this, void 0, void 0, function* () {
        return '3000000';
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
function send(transInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        //  获取nonce,使用本地私钥发送交易
        try {
            const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(transInfo.network));
            const pubkey = private2Account(web3, transInfo.privateKey);
            const gasPrice = yield defaultGasPrice(web3);
            const chainId = yield web3.eth.net.getId();
            const gasLimit = web3_1.default.utils.toHex(yield defaultGasLimit());
            for (let i = 0; i < transInfo.to.length; i++) {
                const nonce = yield txnonce(web3, pubkey);
                const value = web3.utils.toHex(web3.utils.toWei(`${transInfo.amount[i]}`, 'ether'));
                const txParams = {
                    from: pubkey,
                    to: transInfo.to[i],
                    chainId,
                    nonce: web3_1.default.utils.toHex(nonce),
                    gasPrice,
                    gasLimit,
                    // 调用合约转账value这里留空
                    value,
                };
                const etx = new EthereumTx(txParams);
                // 引入私钥，并转换为16进制
                const privateKeyHex = Buffer.from(transInfo.privateKey.replace(/^0x/, ''), 'hex');
                // 用私钥签署交易
                etx.sign(privateKeyHex);
                // // 序列化
                const serializedTx = etx.serialize();
                const signedTxHex = `0x${serializedTx.toString('hex')}`;
                const receipt = yield web3.eth.sendSignedTransaction(signedTxHex);
                console.log(`SUCCESS => ${transInfo.to[i]} : ${transInfo.amount[i]}  ${receipt.transactionHash}}`);
            }
        }
        catch (e) {
            throw new Error(e.message);
        }
    });
}
function transferLocalValue(options) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log('call local: ', options)
        try {
            let opt = parseOptions(options);
            yield send(opt);
        }
        catch (e) {
            console.log('错误: ' + e.message);
        }
    });
}
//# sourceMappingURL=ycj-transfer.js.map