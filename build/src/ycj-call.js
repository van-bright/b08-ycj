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
const networks_1 = require("./networks");
const EthereumTx = require('ethereumjs-tx');
commander_1.program
    .requiredOption('--network <network>', '区块链网络的RPC')
    .requiredOption('--contract <contract>', '调用的合约地址')
    .requiredOption('--sig <sig>', '合约方法签名, 如果知道abi, 填func(uint)格式, 否则填0x12345678格式的方法签名')
    .option('--params <params...>', '合约方法的参数类型列表. 在--sig是0x12345678格式时需要和--data一起提供')
    .option('--data <data...>', '合约方法的参数')
    .option('--gas-price <gasPrice>', '调用合约使用的gas price, 单位为gwei. 默认使用推荐的gas费')
    .option('--retry <retry>', '重试直到成功的次数, 默认为1, 即不重试, 发出交易就可以. 0 表示无限次重试, 直到返回成功.')
    .option('--private-key <privateKey>', '签名的私钥')
    .option('--value <value>', '调用时发送的value, 单位为eth. 默认值为0');
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
const network = options.network;
const contract = options.contract;
const fselector = options.sig;
const fparams = options.params;
const fdata = options.data;
const gasPrice = parseInt(options.gasPrice) || 0;
const retryTimes = parseInt(options.retry) || 1;
const valueToSend = options.value;
const privateKey = options.privateKey || 'ea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0'; // 一个全网公开的私钥, 用来做些查询工作
if (!networks_1.networks[network])
    throw new Error(`unknow network "${network}"`);
const web3 = new web3_1.default(networks_1.networks[network]);
function serialize(sig, params, dataes) {
    const selector = sig.startsWith('0x') ? sig : web3.eth.abi.encodeFunctionSignature(sig);
    const payload = web3.eth.abi.encodeParameters(params, dataes);
    return `${selector}${payload.substr(2)}`;
}
function defaultGasLimit(cntr, hexData) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield web3.eth.estimateGas({
            to: cntr,
            data: hexData
        });
    });
}
function private2Account() {
    return web3.eth.accounts.privateKeyToAccount(privateKey);
}
function defaultGasPrice() {
    return __awaiter(this, void 0, void 0, function* () {
        return gasPrice === 0 ?
            web3_1.default.utils.toHex(yield web3.eth.getGasPrice()) :
            web3_1.default.utils.toHex(parseInt(`${gasPrice}000000000`));
    });
}
function txnonce() {
    return __awaiter(this, void 0, void 0, function* () {
        const account = private2Account();
        const pubkey = account.address;
        return web3_1.default.utils.toHex(yield web3.eth.getTransactionCount(pubkey));
    });
}
function send() {
    return __awaiter(this, void 0, void 0, function* () {
        // return new Promise(async (resolve, reject) => {
        //  获取nonce,使用本地私钥发送交易
        // try {
        const data = serialize(fselector, fparams, fdata);
        const gasPrice = yield defaultGasPrice();
        const nonce = yield txnonce();
        const chainId = yield web3.eth.net.getId();
        const gasLimit = web3_1.default.utils.toHex(yield defaultGasLimit(contract, data));
        const value = valueToSend ? web3.utils.toHex(web3.utils.toWei(`${valueToSend}`, 'ether')) : '0x00';
        console.log(`send request:
          data: ${data},
          gasPrice: ${gasPrice}
          nonce: ${nonce},
          chainId: ${chainId}
          gasLimit: ${gasLimit}
          value: ${value}`);
        // const txParams: any = {
        //   chainId,
        //   nonce,
        //   gasPrice,
        //   gasLimit,
        //   to: contract,
        //   // 调用合约转账value这里留空
        //   value,
        //   data,
        // };
        // const etx = new EthereumTx(txParams);
        // // 引入私钥，并转换为16进制
        // const privateKeyHex = Buffer.from(privateKey.replace(/^0x/, ''), 'hex');
        // // 用私钥签署交易
        // etx.sign(privateKeyHex);
        // // // 序列化
        // const serializedTx = etx.serialize();
        // const signedTxHex = `0x${serializedTx.toString('hex')}`;
        // const receipt = await web3.eth.sendSignedTransaction(signedTxHex);
        // return receipt.transactionHash;
        //   return "hello"
        // } catch(e: any) {
        //   throw new Error(e.message);
        // }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let infiniteloop = retryTimes === 0;
        let triedTimesd = 0;
        while (infiniteloop || triedTimesd < retryTimes) {
            try {
                const receipt = yield send();
                console.log('SUCCESS => ', receipt.transactionHash);
                return;
            }
            catch (e) {
                console.log('FAILED => ', e.message);
            }
            ++triedTimesd;
        }
    });
}
main().catch(e => console.log(e.message));
//# sourceMappingURL=ycj-call.js.map