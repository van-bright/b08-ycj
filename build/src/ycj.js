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
`);
commander_1.program.showHelpAfterError();
// 配置command
commander_1.program.command('decode', 'to decode input data of a function call');
commander_1.program.command('encode', 'to encode data with specific types');
commander_1.program.command('call', 'to encode data with specific types');
commander_1.program.command('get', 'to read contract info by eth_call');
commander_1.program.parse(process.argv);
if (commander_1.program.args.length === 0) {
    commander_1.program.help();
}
//# sourceMappingURL=ycj.js.map