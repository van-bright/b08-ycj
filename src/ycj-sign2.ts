#!/usr/bin/env node

import { program } from "commander";

import { Chain, Common } from '@ethereumjs/common'
import { Transaction } from '@ethereumjs/tx'
import Web3 from "web3";

program
    .requiredOption('--rpc <rpc>', '区块链网络的rpc')
    .requiredOption('--private-key <privateKey>', '签名交易账号的私钥')
    .requiredOption('--to <to>', '接收交易的合约账号')
    .requiredOption('--sig <sig>', '方法签名, 如"mint(address,uint256)"')
    .option('--params <params>', '方法的参数, 如"0x123456","12345678"')
    .option('--nonce <nonce>', 'tx的nonce, 缺省使用账号的当前nonce')
    .option('--gas-price <gasPrice>', 'gas price, 缺省将预估')
    .option('--gas-limit <gasLimit>', 'gas limit, 缺省将预估')
    .option('--value <value>', 'payable方法的value')


program.parse(process.argv);

const options = program.opts();

const rpc = options.rpc;
const pk: string = options.privateKey;
const ito = options.to;
const isig = options.sig;
const iparams = options.params;
const inonce = options.nonce;
const igasPrice = options.gasPrice;
const igasLimit = options.gasLimit;
const ivalue = options.value;

const web3 = new Web3(rpc);

async function defaultGasLimit(tx: any) {
    return await web3.eth.estimateGas(tx);
}
async function txnonce(pk: string) {
    const pubkey = getPubkey(pk);
    return await web3.eth.getTransactionCount(pubkey);
}

function getPubkey(pk: string) {
    return web3.eth.accounts.privateKeyToAccount(pk).address;
}


async function main() {

    const nonce = inonce ? parseInt(inonce) : await txnonce(pk);
    const gasPrice = igasPrice
        ? Web3.utils.toHex(Web3.utils.toBN(parseInt(igasPrice)).toString(10))
        : Web3.utils.toHex(await web3.eth.getGasPrice());

        // const from = getPubkey(pk);
        const to = ito;
        const value = ivalue ? web3.utils.toWei(parseFloat(ivalue).toString()) : 0;
        const data = 0;

        const gasLimit = await defaultGasLimit({
            to,
            nonce,
            value,
            data
          }) ;

    // const data =

    const txParams = {
        nonce,
        gasPrice,
        gasLimit,
        to,
        value,
        data,
    };

    const common = new Common({ chain: Chain.Mainnet });
    const tx = Transaction.fromTxData(txParams, { common });

    const privateKey = Buffer.from(
        '8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61',
        'hex'
    )

    const signedTx = tx.sign(privateKey)

    console.log(`v: ${signedTx.v}, r: ${signedTx.r}, s: ${signedTx.s}`)

    const serializedTx = signedTx.serialize()

    console.log(`${serializedTx.toString('hex')}`);
}

main().catch(e => console.log(e));