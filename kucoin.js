import https from "https"
import jsdom from "jsdom"
import ethers from "ethers"
import swapToken from "./swapToken.js"
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const allTokens = require("./allTokensFromCG.json")
let Parser = require('rss-parser');
let parser = new Parser();

const prefix = 'KUCOIN'

let i = 0

const recipient = '';
const slippage = 5;
const tokenToSell = '' //WBNB
const routerAddress = ''
const amountIn = ethers.utils.parseUnits(`0.01`, 'ether');
global.prevTokenAddr = ''
global.lastTokens = ['Coin98', 'Binamon']
const gasLimit = ethers.utils.hexlify(300000) 
const gasPrice = ethers.utils.parseUnits('6', "gwei")

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

const IntervalHandle = setInterval(() => {
    (async () => {
        let feed = await parser.parseURL('https://www.kucoin.com/rss/news?lang=en');
        const newListedToken = feed.items.find(i => i.title.includes('Gets Listed on KuCoin')).title.split('(')[0].trim()

        if (i % 60 === 0) console.log(new Date(), newListedToken)
        i++

        if (!global.lastTokens.includes(newListedToken)) {
            https.get(`https://api.telegram.org/:-/sendMessage?chat_id=1746906776&text=KCC New ann:${newListedToken}`)
            global.lastTokens.push(newListedToken)
        } else {
            return
        }

        const tokenData = allTokens.find(x => x.name === newListedToken.trim())

        const tokenToBuy = tokenData ? tokenData.platforms["binance-smart-chain"] : false
        if (tokenToBuy) {
            clearInterval(IntervalHandle);
            https.get(`https://api.telegram.org/:-/sendMessage?chat_id=1746906776&text= buing kcc:${newListedToken} ${tokenToBuy}`)

            console.log(new Date(), " buing")
            await swapToken({
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
    })();
}, 1000);
