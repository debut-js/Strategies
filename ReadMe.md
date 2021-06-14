# Trading Strategies Based on Debut/Community Edition
**[Switch to Russian](./ReadMe_ru.md)**

Debut is an ecosystem for developing and launching trading strategies. An analogue of the well-known `ZenBot`, but with much more flexible possibilities for constructing strategies. All you need to do is come up with and describe the entry points to the market and connect the necessary [plugins](https://github.com/debut-js/Plugins) to work. Everything else is a matter of technology: **genetic algorithms** - will help you choose the most effective parameters for the strategy (period, stops, and others), **ticker selection module** - will help you find an asset suitable for the strategy (token or share), on which it will work best.

Debut is based on the architecture of the core and add-on plugins that allow flexible customization of any solutions. The main goal of the entire Debut ecosystem is to simplify the process of creating and launching working trading robots on various exchanges. Currently supported: **Tinkoff** and **Binance**.

The project has two starting trading strategies "For example" how to work with the system.

An example of the strategy [SpikesG](/src/strategies/spikes-grid/ReadMe.md) in 200 days. Optimization was carried out in 180 days and 20 days of free work on untrained data.
An initial deposit of *$500 was used*

<p align="center"> <img src="/src/strategies/spikes-grid/img/BATUSDT.png" width="800"> </p>

Strategy statistics were collected based on the [plugin statistics](https://github.com/debut-js/Plugins/tree/master/packages/stats), follow the link to learn more about the meaning of some statistics.

Visualization is done using the [Report plugin](https://github.com/debut-js/Plugins/tree/master/packages/report).

## Community edition
We believe in the power of the community! That is why we decided to publish the project. The community version is free, but it has some limitations in commercial use (income from trading startups is not commerce), as well as technical differences in testing strategies. Join the community, join **[developer chat](https://t.me/joinchat/Acu2sbLIy_c0OWIy)**

## Enterprise edition
Enterprise version is a ready-made set of tools for "big guys", for those who are engaged in trade services or create strategies professionally. Everything is here! And this is all ready to work for you and to increase the speed of your development.

<table>
<thead>
<tr>
<th> Functionality </th>
<th> Community </th>
<th> Enterprise </th>
</tr>
</thead>
<tbody> <tr>
<td> Strategy Tester </td>
<td> ✅ </td>
<td> ✅ </td>
</tr>
<tr>
<td> Emulation of OHLC ticks in the tester </td>
<td> ✅ </td>
<td> ✅ </td>
</tr>
<tr>
<td> Search modle (finder) suitable for the strategy of assets </td>
<td> ✅ </td>
<td> ✅ </td>
</tr>
<tr>
<td> A collection of plugins from the <a href="https://github.com/debut-js/Plugins" target="_blank" rel="noopener"> collection </a> </td>
<td> ✅ </td>
<td> ✅ </td>
</tr>
<tr>
<td> Basic set of ready-made trading strategies </td>
<td> ✅ </td>
<td> ✅ </td>
</tr>
<tr>
<td> M1 candlestick data for tick emulation </td>
<td> ❌ </td>
<td> ✅ </td>
</tr>
<tr>
<td> Synthetic emulation of ticks in the tester (tick size no more than 0.75%) </td>
<td> ❌ </td>
<td> ✅ </td>
</tr>
<tr>
<td> Risk Management System </td>
<td> ❌ </td>
<td> ✅ </td>
</tr>
<tr>
<td> Work reports in <a href="https://t.me/debutjs" target="_blank" rel="noopener"> messenger </a> </td>
<td> ❌ </td>
<td> ✅ </td>
</tr>
<tr>
<td> Ready solutions to run on VPS/VDS and Cloud servers </td>
<td> ❌ </td>
<td> ✅ </td>
</tr>
<tr>
<td> Technical Support </td>
<td> ❌ </td>
<td> ✅ </td>
</tr>
<tr>
<td> System of fast subscriptions to signals by token, for signal sales </td>
<td> ❌ </td>
<td> ✅ </td>
</tr>
</tbody> </table>

We are streaming Enterprise-based deals live on our [telegram channel](https://t.me/debutjs)

**Find out the price by sending a request to [sales@debutjs.io](mailto:sales@debutjs.io)**

**Disclaimer**

- Debut does not guarantee 100% probability of making a profit. Use it at your own peril and risk, relying on your own professionalism.
- Cryptocurrency is a global experiment, so Debut is also. That is, both can fail at any time.
All you need to know

**Remember!** Starting a bot and trading in general requires careful study of the associated risks and parameters.
Incorrect settings can cause serious financial losses.

## System requirements
To work, you need [NodeJS 14.xx/npm 7.xx](https://nodejs.org/en/) ([installation instructions](https://htmlacademy.ru/blog/boost/tools/installing-nodejs))

## [Documentation](https://debutjs.io)

## Project file structure

```
| - .tokens.json - custom access tokens for working with the exchange
| - schema.json - description of the location of the startup files
| - public/- folder for finder reports (created when finder starts)
| - src/
    | - strategies/
        | - strategy1/- strategies directory
            | - bot.ts - Strategy implementation
            | - meta.ts - Meta data, for launching and for optimization
            | - cfgs.ts - Configurations, for launching in tester and genetic
        | - strategy2/
        ...

```

# Installation and configuration

### Obtaining API tokens

[Binance instructions](https://www.binance.com/ru/support/faq/360002502072)

[Tinkoff instructions](https://tinkoffcreditsystems.github.io/invest-openapi/auth)

### Installing tokens
To work, you need to create a .tokens.json file, add a token to it for work.

For Tinkoff:

```json
{
    "tinkoff":" YOU_TOKEN"
}
```

For Binance:
```json
{
    "binance": "YOU_TOKEN",
    "binanceSecret": "YOU_SECRET
}
```

You can use any field name for the token, for more details see the [documentation on token settings]() section.

## Installing npm packages
To install packages, run:
```bash
npm install
```

## Build the project
```bash
npm run compile`
```

*It is recommended to build before each test run*

` npm run compile && npm run ... `

## Start testing on historical data
Historical data will be loaded automatically at startup All loaded data is saved in the `history` folder in the root of the project, then reused.

**Before starting, make sure:**
* The `cfgs.ts` file contains the ticker you need
* To get history in the` .tokens.json file `a token may be required
* The history of a stock or token exists in the requested number of days

To start, run the command:
```bash
npm run testing -- --bot=FTBot --ticker=CRVUSDT --days=200 --gap=20
```

To view the test results in a browser, execute
```bash
npm run serve
```

The results will be available for viewing on `http://localhost: 5000/`

You can read more about the test run parameters in the [documentation](https://debutjs.io/ru/#/)

## Run genetic optimization

Run the command:

```bash
npm run genetic -- --bot=FTBot --ticker=CRVUSDT --days=200 --gap=30 --gen=12 --pop=2000 --log
```

More details about the launch parameters of the genetics can be found in the [documentation](https://debutjs.io/)

After starting with the --log parameter, the geneticist will output data to the console

```bash
Binance history loading from Wed Nov 18 2020 03:00:00 GMT + 0300 (Moscow Standard Time) ...

----- Genetic Start with 17314 candles -----

Generation: 0
Generation time: 5.15 s
Stats: {
   population: 100,
   maximum: 20.8,
   minimum: -1.24,
   mean: 2.5174,
   stdev: 3.8101996325652054
}
Generation: 1
...
```

## Run genetic optimization with tickers/tokens selection
Run the command:
```bash
npm run finder -- --bot=FTBot --ticker=CRVUSDT --days=200 --gap=30 --gen=12 --pop=2000 --log
```
Use the `--crypt` option to take crypto pairs from the`./Crypt.json` file (By default, there are actual Binance cross-margin pairs)

By default, a set of stock tickers is used for streaming optimization from the file `stocks.json`

You can read more about the parameters for launching streaming genetics in the [documentation](https://debutjs.io/)

## Starting a strategy

Install any process manager for NodeJS, for example PM2,,,

```bash
npm install -g pm2
```

Execute the launch command, the path to the strategy launch file in the `./Out` directory.
An example of such a file can be found here `/src/bootstrap.ts`

``` bash
pm2 start ./out/bootstrap.js
```

To customize the token name in the `.tokens.json` file, you can also pass the launch parameter in the file `.tokens.json` write a token in this format:` {"tinkoffCusotm": "YOU_API_TOKEN"} `

```bash
pm2 start ./out/bootstrap.js -- --token=tinkoffCustom
```

For Binance, parameters launch, you can pass 2: `--btoken=...` `--bsecret=...` if you need to change the name of tokens.

Further, for operation and monitoring, you can use the command set `pm2``

pm2 list` - a list of active processes

`pm2 delete $ pid` - stop a process

`pm2 log` - to view the logs of running processes

and other commands, which can be found in the documentation of the process manager
