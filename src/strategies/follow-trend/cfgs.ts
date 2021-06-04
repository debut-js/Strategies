import { FTOptions } from './bot';

export const CRVUSDT: FTOptions = {
    broker: 'binance',
    ticker: 'CRVUSDT',
    currency: 'USDT',
    interval: '15min',
    stopLoss: 8.62,
    takeProfit: 5.17,
    trailing: false,
    amount: 500,
    fastPeriod: 33,
    slowPeriod: 187,
    openPercent: 8,
    fee: 0.1,
    margin: true,
    id: 29,
};

export const QTUMUSDT: FTOptions = {
    broker: 'binance',
    ticker: 'QTUMUSDT',
    currency: 'USDT',
    interval: '15min',
    stopLoss: 3.88,
    takeProfit: 2.66,
    trailing: false,
    amount: 500,
    fastPeriod: 17,
    slowPeriod: 168,
    openPercent: 4.97,
    fee: 0.1,
    margin: true,
    id: 29,
};
