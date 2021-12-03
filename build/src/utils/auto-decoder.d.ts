import Web3 from "web3";
export default class AutoDecoder {
    web3: Web3;
    constructor(w: Web3);
    detect(): string[][];
}
