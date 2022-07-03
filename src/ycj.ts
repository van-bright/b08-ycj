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
    $ ycj transfer
    $ ycj erc20
    $ ycj erc721
    $ ycj collect
    $ ycj abi
`);

program.showHelpAfterError();
// 配置command
program.command('decode', '用于解码hex编码的数据');
program.command('encode', '用于将数据编码为十六进制格式');
program.command('call', '用于调用合约的非view方法');
program.command('get', '用于通过eth_call方法, 调用合约的view方法');
program.command('account', '用于批量创建账号');
program.command('transfer', '用于批量转账链的本币, 如ETH, BNB等');
program.command('sign', '用于给交易签名');
program.command('erc20', '用于操作标准ERC20合约');
program.command('erc721', '用于操作标准ERC721合约');
program.command('collect', '用于从多个账号中归集代币');
program.command('crypto', '密码学相关的方法');
program.command('abi', 'abi文件处理');


program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}