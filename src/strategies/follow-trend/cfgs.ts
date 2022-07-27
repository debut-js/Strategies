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
    stopLoss: 2.44,
    takeProfit: 8.76,
    amount: 500,
    fastPeriod: 42,
    slowPeriod: 83,
    openPercent: 1.22,
    id: 19,
};
