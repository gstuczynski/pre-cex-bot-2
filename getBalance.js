import ethers from "ethers"


const abi =     [
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "type": "function"
    }
]

const tokenAddress = ''



const options = {
  address: '', // your (target) address
  provider: new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/')
}

const getBalance = async (options) => {
    const contract = new ethers.Contract(tokenAddress, abi, options.provider);
    const balance = await contract.balanceOf(options.address);
    return balance.toString();
};

setInterval(async () => {
    console.log(await getBalance(options))
}, 1000)

