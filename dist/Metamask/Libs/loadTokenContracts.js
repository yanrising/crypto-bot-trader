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
const token_1 = __importDefault(require("../../Records/token"));
function loadTokenContracts(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = params.page;
        const C = params.C;
        try {
            let currentUrl = page.url();
            let addTokenUrl = [
                C.urls.prefix,
                currentUrl.match(/\/\/(.*?)\//i)[1],
                "/home.html#add-token"
            ].join("");
            let tokenContracts = token_1.default.tokenContracts();
            for (let index in tokenContracts) {
                yield page.goto(addTokenUrl);
                let tokenContract = tokenContracts[index];
                console.log("Adding " + tokenContract['slug'] + " token ...");
                yield page.focus(C.elements.add_token.input_contract_address);
                yield page.type(C.elements.add_token.input_contract_address, tokenContract['contract']);
                yield page.focus(C.elements.add_token.input_custom_symbol);
                yield page.type(C.elements.add_token.input_custom_symbol, tokenContract['slug']);
                yield page.waitForTimeout(1000);
                yield page.focus(C.elements.add_token.input_custom_decimals);
                yield page.type(C.elements.add_token.input_custom_decimals, (tokenContract['decimals']).toString());
                const [buttonNext] = yield page.$x(C.elements.add_token.button_next_xpath);
                buttonNext.click();
                yield page.waitForNavigation();
                const [buttonAddTokens] = yield page.$x(C.elements.add_token.button_add_token_xpath);
                buttonAddTokens.click();
                yield page.waitForNavigation();
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.default = loadTokenContracts;
