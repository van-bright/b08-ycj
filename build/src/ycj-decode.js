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
commander_1.program
    .requiredOption('--data <data>', 'input data to decode')
    .option('--sig <sig...>', 'to use latest version')
    .option('-s, --simple', 'input data with out function signature')
    .option('-a, --ascii', 'decode hex string to ascii string');
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
const web3 = new web3_1.default("https://127.0.0.1");
function try_parse_signature(hexSig) {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield (0, cross_fetch_1.default)(`https://www.4byte.directory/api/v1/signatures/?hex_signature=${hexSig}`);
        if (resp.status !== 200)
            return hexSig;
        const dict = yield resp.json();
        if (dict.count === 0)
            return hexSig;
        return dict.results[0].text_signature;
    });
}
function print(funcSig, params) {
    let output = [];
    const len = parseInt(params['__length__']) || 0;
    for (let i = 0; i < len; ++i) {
        output.push(` ${params[i.toString()]}`);
    }
    console.log(`\n${funcSig}  ${output}`);
}
function generate_abi_object(types) {
    return types;
}
function main(sig, data, isSimple) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options.ascii) {
            const out = web3.utils.hexToAscii(data);
            console.log(out);
            return;
        }
        let abi = [];
        if (isSimple) {
            abi = generate_abi_object(sig);
            const params = web3.eth.abi.decodeParameters(abi, data);
            print("", params);
        }
        else {
            let funcSig = data.substr(0, 10);
            const decodeFuncSig = yield try_parse_signature(funcSig);
            // let abi;
            // if (funcSig !== decodeFuncSig) {
            //   let r = /\((.+)\)/g
            //   let a = decodeFuncSig.match(r);
            //   let sa = RegExp.$1;
            //   abi = sa.split(',')
            // } else {
            // abi = generate_abi_object(sig);
            // }
            if (sig)
                abi = generate_abi_object(sig);
            const pureData = `0x${data.substr(10)}`;
            const params = web3.eth.abi.decodeParameters(abi, pureData);
            print(decodeFuncSig, params);
        }
    });
}
main(options.sig, options.data, options.simple).catch(e => console.log(e));
//# sourceMappingURL=ycj-decode.js.map