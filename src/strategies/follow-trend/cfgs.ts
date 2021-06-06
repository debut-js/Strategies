import { FTOptions } from './bot';

export const CRVUSDT: FTOptions = {
    broker: 'binance',
    ticker: 'CRVUSDT',
    currency: 'USDT',
    interval: '15min',
    stopLoss: 7.59,
    takeProfit: 5.35,
    trailing: false,
    amount: 500,
    fastPeriod: 33,
    slowPeriod: 185,
    openPercent: 7.85,
    fee: 0.1,
    margin: true,
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
