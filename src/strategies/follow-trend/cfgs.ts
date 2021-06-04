import { FTOptions } from './bot';

export const AVAXUSDT: FTOptions = {
    broker: 'binance',
    ticker: 'AVAXUSDT',
    currency: 'USDT',
    interval: '5min',
    stopLoss: 8.08,
    takeProfit: 2,
    trailing: false,
    amount: 500,
    fastPeriod: 22,
    slowPeriod: 137,
    openPercent: 2.13,
    fee: 0.1,
    margin: true,
    id: 29,
};

export const OMGUSDT: FTOptions = {
    broker: 'binance',
    ticker: 'OMGUSDT',
    currency: 'USDT',
    interval: '5min',
    stopLoss: 8.84,
    takeProfit: 2.47,
    trailing: false,
    amount: 500,
    fastPeriod: 16,
    slowPeriod: 159,
    openPercent: 1.07,
    fee: 0.1,
    margin: true,
    id: 29,
};

export const XLMUSDT: FTOptions = {
    broker: 'binance',
    ticker: 'XLMUSDT',
    currency: 'USDT',
    interval: '5min',
    stopLoss: 7.4,
    takeProfit: 0.37,
    trailing: false,
    amount: 500,
    fastPeriod: 7,
    slowPeriod: 117,
    openPercent: 1.31,
    fee: 0.1,
    margin: true,
    id: 29,
};
