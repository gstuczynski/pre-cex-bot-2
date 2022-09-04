import ethers from "ethers"
import swapToken from "./swapToken.js"
import axios from "axios"
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const allTokens = require("./allTokensFromCG.json")


global.i = 0

const recipient = '';
const slippage = 5;
const tokenToSell = '' //WBNB
const routerAddress = ''
const amountIn = ethers.utils.parseUnits(`1`, 'ether');
global.prevTokenAddr = ''
const gasLimit = ethers.utils.hexlify(300000) 
const gasPrice = ethers.utils.parseUnits('7', "gwei")

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
        url: 'https://www.binance.com/en/support/announcement/c-48',
        announcementRegex: /Binance Will List.*?\)/g,
        extractNameFromAnnFunction(ann) {
            return ann.substring(ann.indexOf('list') + 5, ann.indexOf('(')).trim()
        },
        lastAnn: 'Binance Will List Yield Guild Games (YGG)'
    },
    {
        url: 'https://www.huobi.com/support/en-us/list/360000039942',
        announcementRegex: /Will List.*?\)/g,
        extractNameFromAnnFunction(ann) {
            return ann.substring(ann.indexOf("(") + 1, ann.lastIndexOf(")")).trim()
        },
        lastAnn: 'Will List GAL (Galatasaray Fan Token)'
    },
    // {
    //     url: 'https://www.kucoin.com/rss/news?lang=en',
    //     announcementRegex: /(?<=A\[(.*?)).*Listed on KuCoin/g,
    //     extractNameFromAnnFunction(ann) {
    //         return ann.substring(ann.indexOf("(") + 1, ann.lastIndexOf(")")).trim()
    //     },
    //     lastAnn: 'Wrapped NCG (WNCG) Gets Listed on KuCoin'
    // }
]

const IntervalHandle = setInterval(() => {
    ExtractData.forEach(({ url, announcementRegex, extractNameFromAnnFunction, lastAnn }) => {
        axios.get(url)
            .then((response) => {
                const announcement = response.data.match(announcementRegex)[0]

                if (i % 60 === 1) console.log(announcement)

                if (announcement === lastAnn) return

                lastAnn = announcement
                const tokenName = extractNameFromAnnFunction(announcement.toLowerCase())
                const tokenData = allTokens.find(x => x.name.toLowerCase() === tokenName)
                const tokenToBuy = tokenData ? tokenData.platforms["binance-smart-chain"] : false
                if (tokenToBuy) {
                    debugger
                    clearInterval(IntervalHandle)
                    if (tokenToBuy) {
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
                            gasPrice,
                        })
                    }
                }
            }).catch((error) => {
                console.error('err');
            });
        
    })
    global.i++
    if (global.i === 50000) global.i = 0
}, 2000)
