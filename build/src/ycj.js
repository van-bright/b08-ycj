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
`);
commander_1.program.showHelpAfterError();
// 配置command
commander_1.program.command('decode', '解码十六进制编码的数据');
commander_1.program.command('encode', '将数据编码为十六进制数据');
commander_1.program.command('call', '调用合约的非view方法');
commander_1.program.command('get', '通过eth_call方法调用合约的view方法');
commander_1.program.command('account', '创建账号');
commander_1.program.command('transfer', '批量转账');
commander_1.program.parse(process.argv);
if (commander_1.program.args.length === 0) {
    commander_1.program.help();
}
//# sourceMappingURL=ycj.js.map