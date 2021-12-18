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
const EthereumTx = require('ethereumjs-tx');
class TxSender {
    constructor(network, pk, contract, selector, params, data, value = '0', gasPrice = 0) {
        this.network = network;
        this.privateKey = pk;
        this.contract = contract;
        this.selector = selector;
        this.params = params;
        this.data = data;
        this.gasPrice = gasPrice;
        this.value = value;
        this.web3 = new web3_1.default(network);
    }
    serialize(sig, params, dataes) {
        const selector = sig.startsWith('0x') ? sig : this.web3.eth.abi.encodeFunctionSignature(sig);
        const payload = this.web3.eth.abi.encodeParameters(params, dataes);
        return `${selector}${payload.substr(2)}`;
    }
    defaultGasLimit(cntr, nonce, value, hexData) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = this.private2Account();
            const from = account.address;
            return yield this.web3.eth.estimateGas({
                from,
                to: cntr,
                nonce,
                value,
                data: hexData
            });
        });
    }
    private2Account() {
        return this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
    }
    defaultGasPrice() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.gasPrice === 0 ?
                web3_1.default.utils.toHex(yield this.web3.eth.getGasPrice()) :
                web3_1.default.utils.toHex(parseInt(`${this.gasPrice}000000000`));
        });
    }
    txnonce() {
        return __awaiter(this, void 0, void 0, function* () {
            const account = this.private2Account();
            const pubkey = account.address;
            return yield this.web3.eth.getTransactionCount(pubkey);
        });
    }
    send() {
        return __awaiter(this, void 0, void 0, function* () {
            //  获取nonce,使用本地私钥发送交易
            try {
                const data = this.serialize(this.selector, this.params, this.data);
                const gasPrice = yield this.defaultGasPrice();
                const nonce = yield this.txnonce();
                const chainId = yield this.web3.eth.net.getId();
                const value = this.value !== '0' ? this.web3.utils.toHex(this.web3.utils.toWei(`${this.value}`, 'ether')) : '0x00';
                const gasLimit = web3_1.default.utils.toHex(yield this.defaultGasLimit(this.contract, nonce, value, data));
                // console.log(`send request:
                //   data: ${data},
                //   gasPrice: ${gasPrice}
                //   nonce: ${nonce},
                //   chainId: ${chainId}
                //   gasLimit: ${gasLimit}
                //   value: ${value}`
                // );
                const txParams = {
                    chainId,
                    nonce: web3_1.default.utils.toHex(nonce),
                    gasPrice,
                    gasLimit,
                    to: this.contract,
                    // 调用合约转账value这里留空
                    value,
                    data,
                };
                const etx = new EthereumTx(txParams);
                // 引入私钥，并转换为16进制
                const privateKeyHex = Buffer.from(this.privateKey.replace(/^0x/, ''), 'hex');
                // 用私钥签署交易
                etx.sign(privateKeyHex);
                // // 序列化
                const serializedTx = etx.serialize();
                const signedTxHex = `0x${serializedTx.toString('hex')}`;
                const receipt = yield this.web3.eth.sendSignedTransaction(signedTxHex);
                return receipt;
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
    }
}
exports.default = TxSender;
//# sourceMappingURL=tx-sender.js.map