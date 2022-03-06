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
const TxSender_1 = __importDefault(require("./TxSender"));
commander_1.program
    .requiredOption('--network <network>', '区块链网络的名称, 如"bsc", "matic", 或者rpc地址')
    .option('--contract <contract>', '被调用的合约地址')
    .option('--method <method>', '合约方法签名, 如 transfer')
    .option('--data <data>', '合约方法的实际参数值, 如 --data ["0x2Bfexxx", "1000000"]')
    .option('--gas-price <gasPrice>', '调用合约使用的gas price, 单位为gwei. 默认使用推荐的gas费')
    .option('--gas-limit <gasLimit>', '使用的gas上限, 如不提供, 将使用预估的gas limit')
    .option('--private-key <privateKey>', '签名的私钥')
    .option('-s, --sign', '仅仅输出签名后的交易, 但是不发送');
commander_1.program.addHelpText('after', `
用法示例:
$ ycj erc20 --network matic --contract 0xd50d167dd35d256e19e2fb76d6b9bf9f4c571a3e --method balanceOf --data '["0x18d3c20a79fbceb89fa1dad8831dcf6ebbe27491"]'

  该命令支持ERC20规范的接口, 原型如下:

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(address sender,address recipient,uint256 amount) external returns (bool);
`);
commander_1.program.parse(process.argv);
const options = commander_1.program.opts();
function callViewMethod(tx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const txSender = new TxSender_1.default(options.network);
            const s = yield txSender.query(tx);
            return s;
        }
        catch (e) {
            console.log('error: ', e);
            throw new Error(e);
        }
    });
}
function callMethod(tx, hasData = true) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const txSender = new TxSender_1.default(options.network, options.privateKey);
            const signedHex = yield txSender.sign(tx);
            if (options.sign) {
                console.log(signedHex);
            }
            else {
                const receipt = yield txSender.send(signedHex);
                console.log(receipt.transactionHash);
            }
        }
        catch (e) {
            console.log('error: ', e);
            throw new Error(e);
        }
    });
}
function totalSupply() {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = {
            to: options.contract,
            data: {
                method: "totalSupply"
            },
        };
        let r = yield callViewMethod(tx);
        let v = web3_1.default.utils.toBN(r).toString(10);
        console.log(v);
    });
}
function balanceOf() {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = {
            to: options.contract,
            data: {
                method: "balanceOf",
                params: ["address"],
                args: JSON.parse(options.data),
            },
        };
        let r = yield callViewMethod(tx);
        let v = web3_1.default.utils.toBN(r).toString(10);
        console.log(v);
    });
}
function transfer() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options.data)
            throw new Error('需要输入--data参数');
        const tx = {
            to: options.contract,
            data: {
                method: "transfer",
                params: ["address", "uint256"],
                args: JSON.parse(options.data),
            },
            gasLimit: options.gasLimit,
            gasPrice: options.gasPrice
        };
        yield callMethod(tx);
    });
}
function allowance() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options.data)
            throw new Error('需要输入--data参数');
        const tx = {
            to: options.contract,
            data: {
                method: "allowance",
                params: ["address", "address"],
                args: JSON.parse(options.data),
            },
            gasLimit: options.gasLimit,
            gasPrice: options.gasPrice
        };
        yield callMethod(tx);
    });
}
function approve() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options.data)
            throw new Error('需要输入--data参数');
        const tx = {
            to: options.contract,
            data: {
                method: "approve",
                params: ["address", "uint256"],
                args: JSON.parse(options.data),
            },
            gasLimit: options.gasLimit,
            gasPrice: options.gasPrice
        };
        yield callMethod(tx);
    });
}
function transferFrom() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options.data)
            throw new Error('需要输入--data参数');
        const tx = {
            to: options.contract,
            data: {
                method: "transferFrom",
                params: ["address", "address", "uint256"],
                args: JSON.parse(options.data),
            },
            gasLimit: options.gasLimit,
            gasPrice: options.gasPrice
        };
        yield callMethod(tx);
    });
}
const IERC20 = {
    'totalSupply': totalSupply,
    'balanceOf': balanceOf,
    'transfer': transfer,
    'allowance': allowance,
    'approve': approve,
    'transferFrom': transferFrom
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const f = IERC20[options.method];
        if (!f) {
            throw new Error('only support methods: ' + Object.keys(IERC20));
        }
        yield f();
    });
}
main().catch(e => console.log(e.message));
//# sourceMappingURL=ycj-erc20.js.map