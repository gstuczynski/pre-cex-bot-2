import Binance from 'node-binance-api'
import ethers from "ethers"
import axios from "axios"


const recipient = '';
const slippage = 1;
const tokenToSell = ''
const tokenToBuy = ''
const routerAddress = ''
const amountIn = ethers.utils.parseUnits(`4000`, 'ether');
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



const binance = new Binance()

let bottom = 0
let top = 5

binance.websockets.candlesticks(['BTCUSDT'], "15m", async (candlesticks) => {
    let { k: ticks } = candlesticks;
    let { o: open, c: close } = ticks;
    const diff = (open - close) / open * 100

    if (diff > top) {
        console.log('dddd')
        binance.websockets.terminate( 'BTCUSDT@kline_15m' );

        binance.websockets.terminate(Object.keys(binance.websockets.subscriptions())[0]);
        const amounts = await router.getAmountsOut(amountIn, [tokenToSell, tokenToBuy]);
        const amountOutMin = amounts[1].sub(amounts[1].div(slippage));
        console.log(`
            Buying new token
            =================
            tokenIn: ${amountIn.toString()} ${tokenToSell}
            tokenOut: ${amountOutMin.toString()} ${tokenToBuy}
        `);
        router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            [tokenToSell, tokenToBuy],
            recipient,
            Math.floor(Date.now() / 1000) + 60 * 2,
            {
                'gasLimit': gasLimit,
                'gasPrice': gasPrice
            }
        ).then(tx => {
            console.log('prepare transaction succed')
            tx.wait()
                .then(receipt => {
                    console.log("send transaction succed")
                    console.log(receipt)
                    axios.get(`https://api.telegram.org/:-/sendMessage?chat_id=1746906776&text=DROP BTC`)
                    process.exit()
                })
                .catch(err => {
                    console.log('ERRRRRRR1', err)
                })
        })
            .catch(err => {
                console.log('ERRRRRRR2', err)
            })


    }


    // if(diff < bottom){
    //     bottom = diff
    //     console.log(diff)
    //     https.get(`https://api.telegram.org/:-/sendMessage?chat_id=1746906776&text=Przejebany pump:${diff}%`)
    // }
    // if(diff > 0.2){
    //     console.log('dupa')
    // }

});