import ethers from "ethers"
import swapToken from "./swapToken.js"
import axios from "axios"
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const allTokens = require("./allTokensFromCG.json")

let i = 0

const recipient = '';
const slippage = 5;
const tokenToSell = '' //WBNB
const routerAddress = ''
const amountIn = ethers.utils.parseUnits(`0.01`, 'ether');
global.prevTokenAddr = ''
global.lastAnn = 'Will List SPA (Sperax) on September 18'
const gasLimit = ethers.utils.hexlify(300000) 
const gasPrice = ethers.utils.parseUnits('5', "gwei")

const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
const wallet = new ethers.Wallet('');
const account = wallet.connect(provider);
const router = new ethers.Contract(
    routerAddress,
    [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
        'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
    ],
    account
);

const ExtractData = [
    {
        url: 'https://www.gate.io/articlelist/ann',
        announcementRegex: /will list.*?\)/g,
        extractNameFromAnnFunction(ann) {
            return ann.substring(ann.indexOf('list') + 5, ann.indexOf('(')).trim()
        },
        lastAnn: 'will list Aurox Token (URUS)'
    }
]

const IntervalHandle = setInterval(() => {
    ExtractData.forEach(({ url, announcementRegex, extractNameFromAnnFunction, lastAnn }) => {
        axios.get(url)
            .then((response) => {
                const x = response.data.match(announcementRegex)
                const announcement = x ? x[0] : lastAnn
                if (announcement === lastAnn) return
                lastAnn = announcement
                const tokenName = extractNameFromAnnFunction(announcement.toLowerCase())
                const tokenData = allTokens.find(x => x.name.toLowerCase() === tokenName)

                if (tokenData) {
                    const tokenToBuy = tokenData.platforms["binance-smart-chain"]
                    if (tokenToBuy) {
                        clearTimeout(IntervalHandle)
                        swapToken({
                            router,
                            recipient,
                            slippage,
                            tokenToSell,
                            amountIn,
                            routerAddress,
                            tokenToBuy,
                            provider,
                            gasLimit,
                            gasPrice
                        })
                    }
                }
            }).catch((error) => {
                debugger
                console.error(error);
            });
        if (i % 60 === 0) console.log(lastAnn)
        i++
    })
}, 5000)
