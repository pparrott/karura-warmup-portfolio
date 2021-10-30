// const accountId = `placeholder`
const subscanToken = `7bbf1bdfee98155fe8d631e4a3f147b8`;

const subqlEndpoint = `https://api.subquery.network/sq/pparrott/prices-and-daily-liquidity-pool`;
const subscanEndpoint = `https://polkadot.api.subscan.io/api/open/price_converter`;

const tokenList = ['ACA', 'POLKABTC', 'RENBTC', 'DOT', 'XBTC', 'AUSD'];

const button = document.getElementById('button');

let tokenPrices

async function getBalances(walletID, endpoint) {
    
    let query = `
        query {
          accounts (filter:{id:{equalTo:"${walletID}"}}) {  
            nodes {
              balances {
                nodes {
                  currency 
                  balance
                }
              }
            }
          }
        }`

    let returnData = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            query
        })
    })
        .then(r => r.json(), 'data missing')
    
    const parsedData = returnData.data.accounts.nodes[0].balances.nodes;

    return parsedData
}

async function retrieveBalance(walletAmounts, currency) {
    for (let i = 0; i < walletAmounts.length; i++) {
        if (walletAmounts[i].currency == currency) {
            return String(Number(walletAmounts[i].balance)*10**-13);
        }
    }
    return 'No information available'
}

function crunchLiquidity(liquiditySummaries) {
    let tokenSummary = {}
    for (let i = 0; i < liquiditySummaries.length; i++) {
        const token0 = liquiditySummaries[i].token0
        const token1 = liquiditySummaries[i].token1
        const token0Val = liquiditySummaries[i].token0DailyTotal
        const token1Val = liquiditySummaries[i].token1DailyTotal

        const objName = [token0, token1].join('|')

        if (tokenSummary[objName]) {
            tokenSummary[objName]['token0Val'] += Number(token0Val);
            tokenSummary[objName]['token1Val'] += Number(token1Val);
        } else {
            tokenSummary[objName] = {};
            tokenSummary[objName]['token0'] = token0;
            tokenSummary[objName]['token1'] = token1;
            tokenSummary[objName]['token0Val'] = Number(token0Val);
            tokenSummary[objName]['token1Val'] = Number(token1Val);
        }
    }

    return tokenSummary
}

async function makeLiquidityPools(endpoint) {
    query = `
      query {
        liquidityDailySummaries {
          nodes {
            token0
            token1
            token0DailyTotal
            token1DailyTotal
          }
        }
      }`
    
    let returnData = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            query
        }) 
    })
        .then(r => r.json(), 'data missing')

    let parsedData = returnData.data.liquidityDailySummaries.nodes;

    const tokenPrices = crunchLiquidity(parsedData);
    
    return tokenPrices
}

function retrieveTokenPrice(currency) {
    let valName;
    let tokenPrice;
    let liquidity;

    if (currency == "AUSD") {
        return '1'
    } else if (currency > "AUSD") {
        valName = ["AUSD", currency].join('|');
    } else {
        valName = [currency, "AUSD"].join('|');
    }

    liquidity = tokenPrices[valName];

    if (liquidity['token0'] == 'AUSD') {
        tokenPrice = Number(liquidity['token0Val']) / Number(liquidity['token1Val']);
    } else {
        tokenPrice = Number(liquidity['token1Val']) / Number(liquidity['token0Val']);
    }


    return String(tokenPrice)
}

async function populatePortfolio() { 
    const walletBalance = document.getElementById('walletBalance');
    const walletToken = document.getElementById('walletToken').value;
    
    const walletAmounts = await getBalances(walletToken, subqlEndpoint);

    // remove existing data
    walletBalance.textContent = '';

    for (let i = 0; i < tokenList.length; i++) {
        // token headiung
        let tokenName = document.createElement('p');
        tokenName.textContent = tokenList[i];
        walletBalance.appendChild(tokenName);

        // Current wallet balance
        let tokenAmount = document.createElement('p');
        let tokenAmountVal = await retrieveBalance(walletAmounts, tokenList[i])
        tokenAmount.textContent = `Current Balance: ${tokenAmountVal}`
        walletBalance.appendChild(tokenAmount);

        // Current token price 
        let tokenPrice = document.createElement('p');
        const tokenPriceVal = retrieveTokenPrice(tokenList[i]);
        tokenPrice.textContent = `Current token price (in AUSD): ${tokenPriceVal}`;
        walletBalance.appendChild(tokenPrice)
    }

    
}

async function main() {
    tokenPrices = await makeLiquidityPools(subqlEndpoint);
    button.addEventListener('click', populatePortfolio);
}

// run main script
main();