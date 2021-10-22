import { BinanceTransport } from '@debut/community-core';
import { DebutOptions, OrderType } from '@debut/types';
import { cli, math } from '@debut/plugin-utils';
import { BuySellMeter } from './metrics/buysell';
import asciichart from 'asciichart';
import { Trader } from './trader';
import { CorrelationMeter } from './metrics/correlation';
import { SMA } from '@debut/indicators';
import readline from 'readline';

const { binance, binanceSecret } = cli.getTokens();
const transport = new BinanceTransport(binance, binanceSecret);
const traderTransport = new BinanceTransport(binance, binanceSecret);
const corrs = [];
const sma = new SMA(12);
const slowSma = new SMA(40);
const tickers = ['ETH', 'BTC', 'ETC', 'XRP'];
const altcoins = ['FTM', 'GALA', 'SOL', 'UNI', 'ADA'];
const currency = 'USDT';
const baseOpts: DebutOptions = {
    broker: 'binance',
    ticker: null,
    currency: 'USDT',
    interval: '1min',
    amount: 500,
    fee: 0,
};
let statsText = '';
let totalBuy = 0;
let totalSell = 0;
let counter = 0;

const datasetBuy = [];
const datasetBuySlow = [];
const datasetProfit = [];
const datasetOrders = [];
const logOrder = (string: string, stream: string) => {
    if (stream === 'deals') {
        datasetOrders.push(string);
    }

    if (stream === 'stats') {
        statsText = string;
    }
};

const traderOpts: DebutOptions = { ...baseOpts, ticker: 'FTMUSDT', sandbox: true, fee: 0 };
const trader = new Trader(traderTransport, traderOpts, logOrder);

const print = (string: string) => {
    readline.cursorTo(process.stdout, 0);
    readline.clearScreenDown(process.stdout);
    process.stdout.write(string + '\n');
};

let target: OrderType;

async function main() {
    await trader.start();

    const callback = async (buyVolume: number, sellVolume: number) => {
        totalBuy += buyVolume;
        totalSell += sellVolume;
        counter++;

        if (counter === tickers.length) {
            const total = totalBuy + totalSell;
            const change = math.percentChange(totalBuy, total);
            const buyPercent = change && sma.nextValue(change * -1);
            const buyPercentSlow = change && slowSma.nextValue(change * -1);

            if (datasetOrders.length > 7) {
                datasetOrders.shift();
            }

            if (datasetProfit.length > 100) {
                datasetProfit.shift();
            }

            if (datasetBuy.length > 100) {
                datasetBuy.shift();
            }

            if (datasetBuySlow.length > 100) {
                datasetBuySlow.shift();
            }

            const profit = trader.plugins.stats.getState().profit;

            if (datasetProfit[datasetProfit.length - 1] !== profit) {
                datasetProfit.push(profit);
            }

            if (buyPercent) {
                datasetBuy.push(buyPercent);

                if (!buyPercentSlow) {
                    datasetBuySlow.push(buyPercent);
                }
            }

            let signal: OrderType;
            let correlationTrader = 0;

            const header = `${corrs
                .map((item) => {
                    const value: number = item.meter.updateBuyVolume(totalBuy);

                    if (item.meter.opts.ticker === trader.opts.ticker) {
                        correlationTrader = Math.abs(value);
                    }

                    return `${item.ticker}: ${formatCorr(value)}`;
                })
                .join(', ')}`;

            if (buyPercentSlow && correlationTrader > 0.5) {
                if (datasetBuySlow.slice(-1)[0] < 50 && buyPercentSlow > 50) {
                    signal = OrderType.BUY;
                } else if (datasetBuySlow.slice(-1)[0] > 50 && buyPercentSlow < 50) {
                    signal = OrderType.SELL;
                }
            }

            buyPercentSlow && datasetBuySlow.push(buyPercentSlow);

            counter = 0;
            totalSell = 0;
            totalBuy = 0;

            if (!datasetBuy.length) {
                return;
            }

            const chart1 = asciichart.plot([datasetBuy, datasetBuySlow], {
                height: 20,
                colors: [asciichart.blue, asciichart.lightgray],
            });

            const chart2 = asciichart.plot([datasetProfit], {
                height: 10,
                colors: [asciichart.green],
            });

            const disclamer = `\x1b[34mBuyers\x1b[0m activity in percent. Updated at: ${new Date().toLocaleString()}`;
            const ordersHistory = `Orders history:\n${datasetOrders.join('\n')}`;

            print(`${header}\n\n${chart1}\n\n${disclamer}\n\n${chart2}\n\n${ordersHistory}\n\n${statsText}`);

            if (signal) {
                // const nextTarget = buyPercent < 50 ? OrderType.SELL : OrderType.BUY; // goes down
                if (target !== signal) {
                    await trader.closeAll();
                    target = signal;
                }

                if (!trader.orders.length) {
                    await trader.createOrder(signal);
                }
            }
        }
    };

    tickers.forEach((ticker) => {
        const cfg = { ...baseOpts, ticker: ticker + currency };
        const meter = new BuySellMeter(transport, cfg, callback);
    });

    altcoins.forEach((ticker) => {
        const cfg = { ...baseOpts, ticker: ticker + currency };
        const meter = new CorrelationMeter(transport, cfg);
        meter.start();
        corrs.push({ ticker, meter });
    });
}

main();

function formatCorr(corr: number) {
    const colorStart = corr > 0 ? '\x1b[34m' : '\x1b[31m';
    const colorEnd = '\x1b[0m';
    return `${colorStart}${pad(corr)}${colorEnd}`;
}

function pad(num: number) {
    if (!num) {
        return '0.000';
    }
    let str = `${Math.abs(num)}`;

    while (str.length < 5) {
        str += '0';
    }

    return str;
}
