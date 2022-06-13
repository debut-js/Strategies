import { FTOptions } from './bot';

export const TSLA: FTOptions = {
    broker: 'tinkoff',
    ticker: 'TSLA',
    currency: 'USD',
    interval: '1min',
    stopLoss: 3.75,
    takeProfit: 4.63,
    amount: 500,
    fastPeriod: 10,
    slowPeriod: 18,
    openPercent: 1.62,
    fee: 0.1,
    id: 25,
};

export const BTCUSDT: FTOptions = {
    instrumentType: 'MARGIN',
    fee: 0.1,
    lotsMultiplier: 1,
    equityLevel: 1,
    broker: 'binance',
    ticker: 'BTCUSDT',
    currency: 'USDT',
    interval: '15min',
    stopLoss: 4.19,
    takeProfit: 3.99,
    amount: 10000,
    fastPeriod: 21,
    slowPeriod: 91,
    openPercent: 8.78,
    id: 4,
};
