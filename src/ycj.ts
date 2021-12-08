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
program.command('decode', 'to decode input data of a function call');
program.command('encode', 'to encode data with specific types');
program.command('call', 'to encode data with specific types');
program.command('get', 'to read contract info by eth_call');
program.command('account', 'to create some account');

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}