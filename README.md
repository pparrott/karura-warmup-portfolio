# Portfolio page

Intention is to show, for a given account, wallet balances and current price.

Usage is pretty simple, input a valid wallet id and the balances for this wallet will appear. Entire backend is done using the [prices and daily liquidity pool](https://api.subquery.network/sq/pparrott/prices-and-daily-liquidity-pool) endpoint.

This is currently run on the mandala endpoint as we were having issues getting subquery to play nice with the karura endpoint.

From the hackathon:
> Create a portfolio page for Karura including KAR, KSM, and LP token balances. Include an approximate price of all the tokens in the portfolio