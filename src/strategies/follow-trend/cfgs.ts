import { FTOptions } from './bot';

// Попробовать на м5 погонять выглядит перспективно
export const CRVUSDT: FTOptions = {
    broker: 'binance',
    ticker: 'CRVUSDT',
    currency: 'USDT',
    interval: '5min',
    stopLoss: 6.42,
    takeProfit: 1.27,
    trailing: false,
    amount: 500,
    fastPeriod: 42,
    slowPeriod: 94,
    openPercent: 1.38,
    fee: 0.1,
    margin: true,
    id: 29,
};

// Более менее ровный тейк стоп
export const FTMUSDT: FTOptions = {
    broker: 'binance',
    ticker: 'FTMUSDT',
    currency: 'USDT',
    interval: '15min',
    stopLoss: 6.75,
    takeProfit: 4.08,
    trailing: false,
    amount: 500,
    fastPeriod: 35,
    slowPeriod: 129,
    openPercent: 1.65,
    margin: true,
    fee: 0.1,
    id: 29,
};
