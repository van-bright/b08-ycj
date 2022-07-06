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
const colors = require('colors');
commander_1.program
    .requiredOption('--file <file>', 'abi的json文件');
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
const web3 = new web3_1.default('http://localhost:8554');
function handle_event(e) {
    return __awaiter(this, void 0, void 0, function* () {
        let esig = e.name;
        esig += '(';
        for (let i = 0; i < e.inputs.length; i++) {
            esig += e.inputs[i].type;
            if (i != e.inputs.length - 1)
                esig += ',';
        }
        esig += ')';
        let signature = web3.eth.abi.encodeEventSignature(esig);
        console.log(colors.green(signature), ' : event ', esig);
    });
}
function handle_function(f) {
    return __awaiter(this, void 0, void 0, function* () {
        // if (f.stateMutability === 'view') return;
        let fsig = f.name + '(';
        for (let i = 0; i < f.inputs.length; i++) {
            fsig += f.inputs[i].type;
            if (i != f.inputs.length - 1)
                fsig += ',';
        }
        fsig += ')';
        const selector = web3.eth.abi.encodeFunctionSignature(fsig);
        console.log(colors.green(selector), ' : function ', fsig);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const abiFile = require(options.file);
        const abiArray = abiFile.abi;
        for (let it of abiArray) {
            if (it.type === 'event') {
                handle_event(it);
            }
            else if (it.type === 'function') {
                handle_function(it);
            }
        }
    });
}
main().catch(e => console.log(e.message));
//# sourceMappingURL=ycj-abi.js.map