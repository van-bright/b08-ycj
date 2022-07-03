#!/usr/bin/env node

import { program } from "commander";
import Web3 from "web3";

const colors = require('colors');

program
    .requiredOption('--file <file>', 'abi的json文件')

program.parse(process.argv);

const options = program.opts();
const web3 = new Web3('http://localhost:8554');

async function handle_event(e: any) {
    let esig = e.name;

    esig += '(';
    for (let i = 0; i < e.inputs.length; i++) {
        esig += e.inputs[i].type;
        if (i != e.inputs.length - 1) esig += ',';
    }
    esig += ')';

    let signature = web3.eth.abi.encodeEventSignature(esig);
    console.log(colors.green(signature), ' : event ', esig);
}

async function handle_function(f: any) {
    if (f.stateMutability === 'view') return;

    let fsig = f.name + '(';
    for (let i = 0; i < f.inputs.length; i++) {
        fsig += f.inputs[i].type;
        if (i != f.inputs.length - 1) fsig += ',';
    }
    fsig += ')';

    const selector = web3.eth.abi.encodeFunctionSignature(fsig);

    console.log(colors.green(selector), ' : function ', fsig);
}

async function main() {
    const abiFile = require(options.file);
    const abiArray = abiFile.abi;

    for (let it of abiArray) {
        if (it.type === 'event') {
            handle_event(it);
        } else if (it.type === 'function') {
            handle_function(it);
        }
    }
}

main().catch(e => console.log(e.message));