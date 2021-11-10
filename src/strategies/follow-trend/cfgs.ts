import { FTOptions } from './bot';

export const TSLA: FTOptions = {
    instrumentType: 'MARGIN',
    broker: 'tinkoff',
    ticker: 'TSLA',
    currency: 'USDT',
    interval: '15min',
    stopLoss: 3.75,
    takeProfit: 4.63,
    trailing: false,
    amount: 500,
    fastPeriod: 10,
    slowPeriod: 18,
    openPercent: 1.62,
    fee: 0.1,
    id: 25,
};

export const QTUMUSDT: FTOptions = {
    instrumentType: 'MARGIN',
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
    id: 29,
};
