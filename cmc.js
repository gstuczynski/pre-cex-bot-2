import https from "https"
import jsdom from "jsdom"
import ethers from "ethers"
import swapToken from "./swapToken.js"

let i = 0

const mnemonic = '';
const recipient = '';
const slippage = 5;
const tokenToSell = '' //WBNB
const routerAddress = ''
const amountIn = ethers.utils.parseUnits(`0.01`, 'ether');
global.prevTokenAddr = ''


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
            hostname: 'coinmarketcap.com',
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
            console.log('s')
            reject(err);
        });
    });
}

const IntervalHandle = setInterval(() => {
    (async (url) => {

        var allTokensBuff = await httpGet('/new/');
        const allTokensDom = new jsdom.JSDOM(allTokensBuff.toString('utf-8'));
        console.log(new Date())
        i++

        // if (!allTokensDom.window.document.documentElement.querySelectorAll("tbody tr td")[8].querySelector('div').innerHTML.includes("Binance Coin")) {
        //     if(i % 600 === 0){ 
        //         console.log(new Date())
        //         https.get(``)
        //     }
        //     return
        // }
            const newTokenPath = allTokensDom.window.document.documentElement.querySelector("tbody tr td a.cmc-link").getAttribute("href")
            const newTokenBuff = await httpGet(newTokenPath);
            const newTokenDom = new jsdom.JSDOM(newTokenBuff.toString('utf-8'));
            let tokenToBuy = newTokenDom.window.document.documentElement.querySelectorAll("ul li a.link-button")[1].getAttribute("href").split('/').pop()
            console.log(tokenToBuy)
            if(i==20){
                tokenToBuy = ''
            }
            
            if (global.prevTokenAddr != tokenToBuy){
                clearInterval(IntervalHandle);
                https.get(`sendMessage?chat_id=&text=CMC: wchodzę w ${tokenToBuy} :${new Date()}`)
                console.log(new Date())
                global.prevTokenAddr = tokenToBuy
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
        
    })("coinmarketcap.com");
}, 1000);
