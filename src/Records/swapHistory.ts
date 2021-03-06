
import token from './token';
const fs = require('fs');

class SwapHistory implements SwapHistoryNs.SwapHistoryInterface {
    
    private swapHistoryFilePath: string = './swapHistory.json';

    constructor(options? : any) {

        if (!fs.existsSync(this.swapHistoryFilePath)) {
            let tokenContracts: SwapHistoryNs.swaps[] = token.tokenContracts().map( function (token) {
                return {
                    slug: token.slug,
                    current_price: 0,
                    amount_acquired: 0,
                    amount_from: 0
                };
            });
            let initialContent: string = JSON.stringify(tokenContracts);
            fs.writeFileSync(this.swapHistoryFilePath, initialContent);
        }
    }

    protected historyData(): SwapHistoryNs.swaps[] {
        return JSON.parse(fs.readFileSync(this.swapHistoryFilePath, 'utf8'));
    }

    public write(params: SwapHistoryNs.writeParams): boolean {
        let swapHistoryData: SwapHistoryNs.swaps[] = this.historyData();
        for (let index in swapHistoryData) {
            let currentSwap: SwapHistoryNs.swaps = swapHistoryData[index];
            if (currentSwap.slug == params.slug) {
                swapHistoryData[index].amount_acquired = params.amount_acquired;
                swapHistoryData[index].amount_from = params.amount_from;
                swapHistoryData[index].current_price = params.current_price;
                break;
            }
        }
        
        fs.writeFileSync(this.swapHistoryFilePath, JSON.stringify(swapHistoryData));
        
        return true;
    }

    public read(params: SwapHistoryNs.readParams): SwapHistoryNs.swaps | null {
        let slug = params.slug;
        let swapHistoryData: SwapHistoryNs.swaps[] = this.historyData();

        return swapHistoryData.filter( history => history.slug == slug)[0] ?? null;
    }
    
}

export default new SwapHistory;