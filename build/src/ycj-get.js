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
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const networks_1 = require("./networks");
commander_1.program
    .requiredOption('--network <network>', '区块链网络的RPC')
    .requiredOption('--contract <contract>', '调用的合约地址')
    .requiredOption('--sig <sig>', '合约方法签名, 如果知道abi, 填func(uint)格式, 否则填0x12345678格式的方法签名')
    .option('--params <params...>', '合约方法的参数类型列表. 在--sig是0x12345678格式时需要和--data一起提供')
    .option('--data <data...>', '合约方法的参数');
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
const network = options.network;
const contract = options.contract;
const fselector = options.sig;
const fparams = options.params || [];
const fdata = options.data || [];
if (!networks_1.networks[network])
    throw new Error(`unknow network "${network}"`);
const web3 = new web3_1.default(networks_1.networks[network]);
function serialize(sig, params, dataes) {
    const selector = sig.startsWith('0x') ? sig : web3.eth.abi.encodeFunctionSignature(sig);
    const payload = web3.eth.abi.encodeParameters(params, dataes);
    return `${selector}${payload.substr(2)}`;
}
function send() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = serialize(fselector, fparams, fdata);
            const req = {
                "method": "eth_call",
                "params": [
                    {
                        "to": contract,
                        "data": data,
                    },
                    "latest"
                ],
                "id": 666,
                "jsonrpc": "2.0"
            };
            const rsp = yield (0, cross_fetch_1.default)(networks_1.networks[network], {
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield send();
        console.log(data);
    });
}
main().catch(e => console.log(e.message));
//# sourceMappingURL=ycj-get.js.map