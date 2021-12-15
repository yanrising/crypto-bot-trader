"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = __importDefault(require("./Libs/lib"));
class Token {
    constructor(options) {
        this.swapLogFilePath = '../swap.log';
    }
    tokenContracts() {
        return lib_1.default.tokenContracts();
    }
}
exports.default = new Token;
