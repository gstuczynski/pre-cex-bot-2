//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
import axios from "axios"

const swapToken = async ({
  router,
  recipient,
  slippage,
  tokenToSell,
  amountIn,
  tokenToBuy,
  provider,
  gasLimit,
  gasPrice,
}) => {

  const amounts = await router.getAmountsOut(amountIn, [tokenToSell, tokenToBuy]);
  const amountOutMin = amounts[1].sub(amounts[1].div(slippage));
  console.log(nonce)
  console.log(`
      Buying new token
      =================
      tokenIn: ${amountIn.toString()} ${tokenToSell}
      tokenOut: ${amountOutMin.toString()} ${tokenToBuy}
    `);
  debugger
  router.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    [tokenToSell, tokenToBuy],
    recipient,
    Math.floor(Date.now() / 1000) + 60 * 2,
    {
      // 'nonce': nonce,
      'gasLimit': gasLimit,
      'gasPrice': gasPrice
    }
  ).then(tx => {
    console.log('prepare transaction succed')
    tx.wait()
      .then(receipt => {
        console.log("send transaction succed")
        console.log(receipt)
        axios.get(`https://api.telegram.org/bot1808703465:AAEyzevfaB-RdMsyEZdZxrlKNWnZ0PzRnIU/sendMessage?chat_id=1746906776&text=succes: ${tokenToBuy}`)
      })
      .catch(err => {
        console.log('ERRRRRRR1', err)
      })
  })
    .catch(err => {
      console.log('ERRRRRRR2', err)
    })
}


export default swapToken;