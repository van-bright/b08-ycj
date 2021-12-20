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
program.command('decode', '用于解码hex编码的数据');
program.command('encode', '用于将数据编码为十六进制格式');
program.command('call', '用于调用合约的非view方法');
program.command('get', '用于通过eth_call方法, 调用合约的view方法');
program.command('account', '用于批量创建账号');
program.command('transfer', '用于批量转账');

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}