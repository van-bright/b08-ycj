#!/usr/bin/env node
import { program } from "commander";
import pkg from "../package.json";


program.version(pkg.version, '-v,--version');

program.addHelpText('after',
`
  Usages:
    $ ycj decode
    $ ycj encode
    $ ycj call
    $ ycj get
    $ ycj account
`);

program.showHelpAfterError();
// 配置command
program.command('decode', '解码十六进制编码的数据');
program.command('encode', '将数据编码为十六进制数据');
program.command('call', '调用合约的非view方法');
program.command('get', '通过eth_call方法调用合约的view方法');
program.command('account', '创建账号');
program.command('transfer', '批量转账');

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}