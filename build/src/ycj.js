#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const package_json_1 = __importDefault(require("../package.json"));
commander_1.program.version(package_json_1.default.version, '-v,--version');
commander_1.program.addHelpText('after', `
  Usages:
    $ ycj decode
    $ ycj encode
    $ ycj call
    $ ycj get
    $ ycj account
    $ ycj transfer
    $ ycj erc20
    $ ycj erc721
    $ ycj collect
`);
commander_1.program.showHelpAfterError();
// 配置command
commander_1.program.command('decode', '用于解码hex编码的数据');
commander_1.program.command('encode', '用于将数据编码为十六进制格式');
commander_1.program.command('call', '用于调用合约的非view方法');
commander_1.program.command('get', '用于通过eth_call方法, 调用合约的view方法');
commander_1.program.command('account', '用于批量创建账号');
commander_1.program.command('transfer', '用于批量转账链的本币, 如ETH, BNB等');
commander_1.program.command('sign', '用于给交易签名');
commander_1.program.command('erc20', '用于操作标准ERC20合约');
commander_1.program.command('erc721', '用于操作标准ERC721合约');
commander_1.program.command('collect', '用于从多个账号中归集代币');
commander_1.program.command('crypto', '密码学相关的方法');
commander_1.program.parse(process.argv);
if (commander_1.program.args.length === 0) {
    commander_1.program.help();
}
//# sourceMappingURL=ycj.js.map