"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metaMask_1 = __importDefault(require("./Metamask/metaMask"));
const trader_1 = __importDefault(require("./Trader/trader"));
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        // // initiate 
        // await metaMask.build();
        // let response = await trader.analyzeMarket({metamask_with_build: metaMask});
        console.log("METAMASK BUILD");
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield trader_1.default.analyzeMarket({ metamask_with_build: metaMask_1.default });
        }), 5000);
        // let tokenBalances = await metaMask.getBalances();
        // console.log(tokenBalances);
        // console.log(response);
        // process.exit(0);
        // let rsp: boolean;
        // let rsp: boolean = await metaMsk.swapToken('matic', 'link', 1);
        // console.log(rsp);
        // await newMetaMask.page!.waitForTimeout(999999);
        // process.exit(0);
        // process.exit(0);
        // let response = await ApiCoinMarketCap.getMarketPrices();
        // let cryptoList = response.cryptoCurrencyList;
        // console.log(JSON.stringify(cryptoList));
    });
})();