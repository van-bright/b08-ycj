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
  $ ycj erc721 --network matic --contract 0xd50d167dd35d256e19e2fb76d6b9bf9f4c571a3e --method balanceOf --data '["0x18d3c20a79fbceb89fa1dad8831dcf6ebbe27491"]'


  该命令支持ERC721规范的接口, 各方法的原型如下:

  function balanceOf(address owner) external view returns (uint256 balance);

  function ownerOf(uint256 tokenId) external view returns (address owner);

  function safeTransferFrom(address from, address to, uint256 tokenId) external;

  function transferFrom(address from, address to, uint256 tokenId) external;

  function approve(address to, uint256 tokenId) external;

  function getApproved(uint256 tokenId) external view returns (address operator);

  function setApprovalForAll(address operator, bool _approved) external;

  function isApprovedForAll(address owner, address operator) external view returns (bool);

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
function ownerOf() {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = {
            to: options.contract,
            data: {
                method: "ownerOf",
                params: ["uint256"],
                args: JSON.parse(options.data),
            },
        };
        let r = yield callViewMethod(tx);
        let v = TxSender_1.default.decode("address", r);
        console.log(v);
    });
}
function safeTransferFrom() {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = {
            to: options.contract,
            data: {
                method: "safeTransferFrom",
                params: ["address", "address", "uint256"],
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
function approve() {
    return __awaiter(this, void 0, void 0, function* () {
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
function getApproved() {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = {
            to: options.contract,
            data: {
                method: "getApproved",
                params: ["uint256"],
                args: JSON.parse(options.data),
            },
        };
        let r = yield callViewMethod(tx);
        let v = web3_1.default.utils.toBN(r).isZero();
        console.log(!v);
    });
}
function setApprovalForAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = {
            to: options.contract,
            data: {
                method: "setApprovalForAll",
                params: ["address", "bool"],
                args: JSON.parse(options.data),
            },
            gasLimit: options.gasLimit,
            gasPrice: options.gasPrice
        };
        yield callMethod(tx);
    });
}
function isApprovedForAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = {
            to: options.contract,
            data: {
                method: "isApprovedForAll",
                params: ["address", "address"],
                args: JSON.parse(options.data),
            },
        };
        let r = yield callViewMethod(tx);
        let v = web3_1.default.utils.toBN(r).isZero();
        console.log(!v);
    });
}
const IERC721 = {
    'balanceOf': balanceOf,
    'ownerOf': ownerOf,
    'setApprovalForAll': setApprovalForAll,
    'isApprovedForAll': isApprovedForAll,
    'approve': approve,
    'getApproved': getApproved,
    'transferFrom': transferFrom,
    'safeTransferFrom': safeTransferFrom,
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const f = IERC721[options.method];
        if (!f) {
            throw new Error('only support methods: ' + Object.keys(IERC721));
        }
        yield f();
    });
}
main().catch(e => console.log(e.message));
//# sourceMappingURL=ycj-erc721.js.map