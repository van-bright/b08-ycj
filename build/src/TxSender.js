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
const web3_1 = __importDefault(require("web3"));
const networks_1 = require("./networks");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const EthereumTx = require('ethereumjs-tx');
const BN = web3_1.default.utils.toBN;
class TxSender {
    constructor(rpc, pk = 'ea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0') {
        this.rpc = networks_1.networks[rpc] || rpc;
        this.privateKey = pk;
        this.web3 = new web3_1.default(this.rpc);
    }
    serialize(mo) {
        let func;
        if (mo.method.startsWith('0x')) {
            func = mo.method;
        }
        else {
            func = mo.params ? `${mo.method}(${mo.params.join(',')})` : `${mo.method}()`;
            func = this.web3.eth.abi.encodeFunctionSignature(func);
        }
        if (mo.params) {
            const payload = this.web3.eth.abi.encodeParameters(mo.params, mo.args);
            return `${func}${payload.substr(2)}`;
        }
        return func;
    }
    defaultGasLimit(to, nonce, value, hexData) {
        return __awaiter(this, void 0, void 0, function* () {
            const from = this.getPubkey();
            return yield this.web3.eth.estimateGas({
                from,
                to,
                nonce,
                value,
                data: hexData
            });
        });
    }
    defaultGasPrice(gasPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            if (gasPrice) {
                const g = parseFloat(gasPrice);
                const gas = g * 10 ** 9;
                return web3_1.default.utils.toHex(BN(gas).toString(10));
            }
            else {
                return web3_1.default.utils.toHex(yield this.web3.eth.getGasPrice());
            }
        });
    }
    txnonce() {
        return __awaiter(this, void 0, void 0, function* () {
            const pubkey = this.getPubkey();
            return yield this.web3.eth.getTransactionCount(pubkey);
        });
    }
    getPubkey() {
        return this.web3.eth.accounts.privateKeyToAccount(this.privateKey).address;
    }
    sign(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            //  获取nonce,使用本地私钥发送交易
            try {
                const data = tx.data ? this.serialize(tx.data) : undefined;
                const gasPrice = yield this.defaultGasPrice(tx.gasPrice);
                const nonce = yield this.txnonce();
                const chainId = yield this.web3.eth.net.getId();
                let value = '0x00';
                if (tx.value) {
                    if (tx.value.startsWith('0x') || tx.value.startsWith('0X'))
                        value = web3_1.default.utils.toHex(tx.value.substring(2));
                    else
                        value = web3_1.default.utils.toHex(web3_1.default.utils.toWei(`${tx.value}`, 'ether'));
                }
                const gasLimit = web3_1.default.utils.toHex(tx.gasLimit ? tx.gasLimit : yield this.defaultGasLimit(tx.to, nonce, value, data));
                console.log('value: ', value);
                console.log('gasprice: ', gasPrice);
                console.log('gaslimit: ', gasLimit);
                const txParams = {
                    from: tx.from,
                    to: tx.to,
                    chainId,
                    nonce: web3_1.default.utils.toHex(nonce),
                    gasPrice,
                    gasLimit,
                    // 调用合约转账value这里留空
                    value,
                    // data,
                };
                const etx = new EthereumTx(txParams);
                // 引入私钥，并转换为16进制
                const privateKeyHex = Buffer.from(this.privateKey.replace(/^0x/, ''), 'hex');
                // 用私钥签署交易
                etx.sign(privateKeyHex);
                // // 序列化
                const serializedTx = etx.serialize();
                const signedTxHex = `0x${serializedTx.toString('hex')}`;
                return signedTxHex;
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
    send(signedTxHex) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const receipt = yield this.web3.eth.sendSignedTransaction(signedTxHex);
                return receipt;
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
    getBalance(account) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.web3.eth.getBalance(account);
        });
    }
    query(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = this.serialize(tx.data);
                const req = {
                    "method": "eth_call",
                    "params": [
                        {
                            "to": tx.to,
                            "data": data,
                        },
                        "latest"
                    ],
                    "id": 666,
                    "jsonrpc": "2.0"
                };
                const rsp = yield (0, cross_fetch_1.default)(this.rpc, {
                    body: JSON.stringify(req),
                    headers: { "Content-Type": "application/json" },
                    method: "POST"
                });
                if (rsp.status === 200) {
                    return (yield rsp.json()).result;
                }
                throw new Error(`Error: status = ${rsp.status}, ${rsp.statusText}`);
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
}
exports.default = TxSender;
//# sourceMappingURL=TxSender.js.map