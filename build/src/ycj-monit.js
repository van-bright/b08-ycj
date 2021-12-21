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
const networks_1 = require("./networks");
const web3_1 = __importDefault(require("web3"));
const delay_1 = __importDefault(require("delay"));
var EthereumTx = require('ethereumjs-tx');
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
        //  获取nonce,使用本地私钥发送交易
        const pk = '0xced24e91fa4531456b60f9fc01b8041aef9c537cb7f813a0b9ef2f5e81e03fef';
        try {
            const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(networks_1.networks['bsc']));
            const toBN = web3.utils.toBN;
            const pubkey = private2Account(web3, pk);
            const gasPrice = yield defaultGasPrice(web3);
            const chainId = yield web3.eth.net.getId();
            const gasLimit = web3_1.default.utils.toHex(yield defaultGasLimit());
            while (true) {
                let balance = yield web3.eth.getBalance('0x2B6b9a0981aE5b791eF8EEd84Cd8b20BE365E195');
                console.log('balance: ', balance.toString());
                if (balance.toString() !== '0') {
                    const bgbalance = toBN(balance);
                    const limit = toBN(yield defaultGasLimit());
                    const subv = limit.mul(toBN(gasPrice));
                    // console.log('subv: ', subv.toString(10))
                    let v = bgbalance.sub(subv);
                    // console.log('left v: ', v.toString(10))
                    const nonce = yield txnonce(web3, pubkey);
                    const value = web3.utils.toHex(web3.utils.toWei(`${v}`, 'wei'));
                    const txParams = {
                        from: pubkey,
                        to: '0x5A40Ac7dafceCbFAe05D28a85A34b1d131ECB743',
                        chainId,
                        nonce: web3_1.default.utils.toHex(nonce),
                        gasPrice,
                        gasLimit,
                        // 调用合约转账value这里留空
                        value,
                    };
                    const etx = new EthereumTx(txParams);
                    // 引入私钥，并转换为16进制
                    const privateKeyHex = Buffer.from(pk.replace(/^0x/, ''), 'hex');
                    // 用私钥签署交易
                    etx.sign(privateKeyHex);
                    // // 序列化
                    const serializedTx = etx.serialize();
                    const signedTxHex = `0x${serializedTx.toString('hex')}`;
                    const receipt = yield web3.eth.sendSignedTransaction(signedTxHex);
                }
                yield (0, delay_1.default)(3 * 1000);
            }
        }
        catch (e) {
            throw new Error(e.message);
        }
    });
}
main();
//# sourceMappingURL=ycj-monit.js.map