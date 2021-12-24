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
const lodash_1 = __importDefault(require("lodash"));
const lib_1 = __importDefault(require("./Libs/lib"));
const api_coinmarketcap_1 = __importDefault(require("api.coinmarketcap"));
const swapHistory_1 = __importDefault(require("../Records/swapHistory"));
const logger_1 = __importDefault(require("../Records/logger"));
class Trader {
    constructor(contructorParams) {
        var _a;
        this.exceptionSlugs = ['matic', 'usdc'];
        this.metaMaskWithBuild = contructorParams.metamask_with_build;
        this.token = contructorParams.token;
        this.tokenContractList = this.token.tokenContracts();
        this.stableCoin = (_a = this.tokenContractList.filter(contract => contract.stablecoin == true)[0]) !== null && _a !== void 0 ? _a : null;
    }
    map(response_raw_data) {
        let tokenContracts = this.tokenContractList;
        return lib_1.default.map(response_raw_data, tokenContracts);
    }
    /*
     * analyzeMarket : Check wallet balance, decide if it will buy/sell base on the market
     * @params Any
     * @return boolean
     */
    analyzeMarket(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // check stable coin balancebalance
                let tokenBalances = yield this.metaMaskWithBuild.getBalances();
                this.metaMaskWithBuild.clearPopups();
                if (typeof tokenBalances == 'boolean') {
                    return false;
                }
                tokenBalances = (tokenBalances);
                let stableCoinBalance = (_a = tokenBalances.filter((token) => token.slug == this.stableCoin.slug).map(token => Number(token.balance))[0]) !== null && _a !== void 0 ? _a : null;
                // check if will sell or buy
                let responseData = yield api_coinmarketcap_1.default.getMarketPrices(1, 150, { tagSlugs: null });
                let mappedMarketData = this.map((responseData));
                // check token ready for sell
                yield this.sellMode({ mappedMarketData: mappedMarketData, tokenBalances: tokenBalances });
                // await this.buyMode();
                // todo
                /**
                 * Check if usdc (stable coin is empty)
                 * ** If empty, it is ready to buy -> search for good token to buy per condition
                 * ** else check token with balance, watch the token if it is good for sell per condition with a consideration of cutloss
                 * ******* * Check if cutloss reached the max, or if profit to sell
                 */
                return true;
            }
            catch (error) { }
            return false;
        });
    }
    tokenWithBalanceAndMarketData(tokenBalances, mappedMarketData) {
        let exceptionSlugs = this.exceptionSlugs;
        return (tokenBalances).filter(function (token) {
            if (!exceptionSlugs.includes(token.slug) && token.balance > 0) {
                return true;
            }
            return false;
        }).map(function (token) {
            var _a;
            let tokenMarket = (_a = mappedMarketData.filter((tokenMarket) => tokenMarket.symbol == token.slug)[0]) !== null && _a !== void 0 ? _a : {};
            let swapHistoryDataFound = swapHistory_1.default.read({ slug: token.slug });
            let balanceInUSD = tokenMarket.current_price * token.balance;
            return Object.assign(Object.assign(Object.assign(Object.assign({}, token), tokenMarket), {
                history: swapHistoryDataFound
            }), {
                balance_in_usd: balanceInUSD,
                balance_nearest_a_usd: Math.round(balanceInUSD)
            });
        });
    }
    sellMode(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let mappedMarketData = params.mappedMarketData;
            let exceptionSlugs = this.exceptionSlugs;
            console.log(params.tokenBalances);
            // get token with balance except matic
            let tokenWithBalanceAndMarketData = this.tokenWithBalanceAndMarketData(params.tokenBalances, mappedMarketData);
            let sellCutLoss = lodash_1.default.get(this.metaMaskWithBuild.C, 'trading.options.sell_cutloss');
            let sellProfit = lodash_1.default.get(this.metaMaskWithBuild.C, 'trading.options.sell_profit');
            let filteredTokenWithProfitableBalance = tokenWithBalanceAndMarketData.filter((token) => token.balance_nearest_a_usd > 0);
            console.log(filteredTokenWithProfitableBalance);
            if (filteredTokenWithProfitableBalance.length < 1) {
                return false;
            }
            for (let token of filteredTokenWithProfitableBalance) {
                let tokenBalance = lodash_1.default.get(token, 'balance');
                let historyCurrentPrice = lodash_1.default.get(token, 'history.current_price', null);
                let currentPrice = lodash_1.default.get(token, 'current_price');
                let gainsDecimal = (currentPrice - historyCurrentPrice) / currentPrice;
                let gainsPercentage = gainsDecimal * 100;
                let earnings = (tokenBalance * currentPrice) * gainsDecimal;
                let isSell = false;
                let msg = null;
                if (gainsPercentage >= sellProfit) {
                    // sell profit
                    msg = [
                        "Sell Profit: ",
                        gainsPercentage + "%",
                        token.slug,
                        "Earned: " + earnings + " usd",
                    ].join(" ");
                    isSell = true;
                }
                else if (gainsPercentage <= sellCutLoss) {
                    // selling to prevent more loss
                    let msg = [
                        "Cut Loss: ",
                        gainsPercentage + "%",
                        token.slug,
                        "Earned: " + earnings + " usd",
                    ].join(" ");
                    isSell = true;
                }
                if (isSell === true) {
                    logger_1.default.write({ content: msg });
                    yield this.metaMaskWithBuild.swapToken(token.slug, this.stableCoin.slug, tokenBalance, currentPrice);
                }
            }
            return true;
        });
    }
    buyMode() {
        return __awaiter(this, void 0, void 0, function* () {
            // todo
        });
    }
}
exports.default = Trader;
