import Web3 from "web3";

const primitives = [
  'uint256', 'int256', 'address', 'bytes32', 'string', 'uint8', 'int8', 'bool',

  /*'int8',*/ 'int16',  'int24',  'int32',  'int40',  'int48',  'int56',  'int64',
  'int72',  'int80',  'int88',  'int96',  'int104', 'int112', 'int120', 'int128',
  'int136', 'int144', 'int152', 'int160', 'int168', 'int176', 'int184', 'int192',
  'int200', 'int208', 'int216', 'int224', 'int232', 'int240', 'int248', /*'int256'*/,

  /*'uint8'*/,   'uint16',  'uint24',  'uint32',  'uint40',  'uint48',  'uint56',  'uint64',
  'uint72',  'uint80',  'uint88',  'uint96',  'uint104', 'uint112', 'uint120', 'uint128',
  'uint136', 'uint144', 'uint152', 'uint160', 'uint168', 'uint176', 'uint184', 'uint192',
  'uint200', 'uint208', 'uint216', 'uint224', 'uint232', 'uint240', 'uint248', /*'uint256'*/
]

export default class AutoDecoder {
  web3: Web3;

  constructor(w: Web3) {
    this.web3 = w;
  }

  detect(): string[][] {
    return [[]];
  }
}