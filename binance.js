import https from "https"
import jsdom from "jsdom"
import ethers from "ethers"
import swapToken from "./swapToken.js"
// import * as allTokens from './allTokensFromCG.json';
import { createRequire } from "module";
const require = createRequire(import.meta.url); // construct the require method
const allTokens = require("./allTokensFromCG.json") // use the requi


let i = 0

const mnemonic = '';
const recipient = '';
const slippage = 5;
const tokenToSell = '' //WBNB
const routerAddress = ''
const amountIn = ethers.utils.parseUnits(`1`, 'ether');
global.prevTokenAddr = ''
global.lastAnn = 'Binance Adds GALA'

const provider = new ethers.providers.WebSocketProvider('');
const wallet = ethers.Wallet.fromMnemonic(mnemonic);
const account = wallet.connect(provider);
const router = new ethers.Contract(
    routerAddress,
    [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
        'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
    ],
    account
);


function httpGet(path) {
    return new Promise((resolve, reject) => {
        https.get({
            hostname: "www.binance.com",
            path: path,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        }, (resp) => {
            let chunks = [];
            resp.on('data', (chunk) => {
                chunks.push(chunk);
            });
            resp.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
}

const IntervalHandle = setInterval(() => {
    (async (url) => {
        let buff
        try {
            buff = await httpGet('/en/support/announcement/c-48');
        } catch (e) {
            console.error(e);
            https.get(`https://api.telegram.org/:-/sendMessage?chat_id=1746906776&text=BINANCE:${e}`)
            return
        }

        const dom = new jsdom.JSDOM(buff.toString('utf-8'));
        const announcement = dom.window.document.documentElement.querySelector("a[href*='/en/support/announcement/']").innerHTML

        if (announcement !== global.lastAnn) {
            https.get(`https://api.telegram.org/:-/sendMessage?chat_id=1746906776&text=BINANCE New ann:${announcement}`)
            global.lastAnn = announcement
        }

        if (i % 60 === 0) console.log(new Date(), ' Last Announcement: ', announcement)
        i++

        if (!announcement.includes('Binance Will List')) return

        const tokenName = announcement.replace('Binance Will List ', '').replace(/.\(\w+\).*/, '')

        const tokenData = allTokens.find(x => x.name === tokenName)
        const tokenToBuy = tokenData.platforms["binance-smart-chain"]
        if (tokenToBuy && tokenToBuy !== global.prevTokenAddr) {
            clearInterval(IntervalHandle);
            https.get(`https://api.telegram.org/-/sendMessage?chat_id=1746906776&text=BINANCE buing:${announcement} ${tokenToBuy}`)

            console.log(new Date(), " buing")
            await swapToken({
                router,
                recipient,
                slippage,
                tokenToSell,
                amountIn,
                routerAddress,
                tokenToBuy,
                provider
            })
            process.exit()
        }
    })("www.binance.com");
}, 1000);
