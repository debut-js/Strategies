import { BinanceTransport } from '@debut/community-core';
import { DebutOptions } from '@debut/types';
import { math } from '@debut/plugin-utils';
import { BuySellMeter } from './meter';
import asciichart from 'asciichart';

const transport = new BinanceTransport();
const tickers = ['BTC', 'ETH', 'ADA', 'UNI', 'DOGE', 'BNB', 'DOT', 'XRP', 'SOL', 'LINK', 'ALGO', 'LTC'];
const currency = 'USDT';
const baseOpts: DebutOptions = {
    broker: 'binance',
    ticker: null,
    currency: 'USDT',
    interval: '15min',
    amount: 500,
};

let totalBuy = 0;
let totalSell = 0;
let counter = 0;

const datasetBuy = [];
const datasetSell = [];

const print = (string: string) => {
    process.stdout.cursorTo(0, 0);
    process.stdout.clearScreenDown();
    process.stdout.write(string + '\n');
};

const callback = (buyVolume: number, sellVolume: number) => {
    totalBuy += buyVolume;
    totalSell += sellVolume;
    counter++;

    if (counter === tickers.length) {
        const total = totalBuy + totalSell;
        const buyPercent = math.percentChange(totalBuy, total) * -1;
        const sellPercent = math.percentChange(totalSell, total) * -1;

        if (datasetBuy.length > 100) {
            datasetBuy.shift();
            datasetSell.shift();
        }

        datasetBuy.push(buyPercent);
        datasetSell.push(sellPercent);
        counter = 0;
        totalSell = 0;
        totalBuy = 0;

        print(
            asciichart.plot([datasetBuy, datasetSell], {
                height: 30,
                colors: [asciichart.blue, asciichart.red],
            }),
        );

        process.stdout.write(
            `\x1b[34mBuyers\x1b[0m and \x1b[31mSellers\x1b[0m activity in percent. Updated at: ${new Date().toLocaleString()}\n`,
        );
    }
};

tickers.forEach((ticker) => {
    const cfg = { ...baseOpts, ticker: ticker + currency };
    const meter = new BuySellMeter(transport, cfg, callback);
});
