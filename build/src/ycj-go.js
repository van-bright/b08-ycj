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
function send() {
    return __awaiter(this, void 0, void 0, function* () {
        const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(networks_1.networks['bsc']));
        const signedTransferbnb = '0xf86c0485012a05f222825208942b6b9a0981ae5b791ef8eed84cd8b20be365e1958703e871b540c000808193a0cc86beb2e8c7e2a1df672b2c2a1aac3bc26ff159a24d9a8542c2cbc77149430aa0538d7de6f7a58395d2c5e5d0c752d3f1844e4b90787d20cc7d67e32ebf052c32';
        const signedErc20 = '0xf8ac82015385012a05f21e82d6d89494b69263fca20119ae817b6f783fc0f13b02ad5080b844a9059cbb0000000000000000000000005a40ac7dafcecbfae05d28a85a34b1d131ecb743000000000000000000000000000000000000000000000015779a9de6eeb000008194a0fe0d285be40edf32110848beb88145e8910719a6955404ffe6337ed84c4f0d9ea07ecc9f4dbfd7e92fcd2a2c6c540fcad159ea090bf045db519622933a60c38450';
        web3.eth.sendSignedTransaction(signedTransferbnb).catch(e => { console.log('transfer: ', e); });
        while (true) {
            web3.eth.sendSignedTransaction(signedErc20).catch(e => { console.log("erc20: ", e); });
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield send();
        }
        catch (e) {
            console.log('错误: ' + e.message);
        }
    });
}
main();
//# sourceMappingURL=ycj-go.js.map