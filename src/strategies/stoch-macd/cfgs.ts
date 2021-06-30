import { StochMacdOptions } from './bot';

export const TSLA: StochMacdOptions = {
    // debut config
    broker: 'tinkoff',
    ticker: 'TSLA',
    currency: 'USD',
    interval: '1h',
    amount: 1000,
    periodEmaFast: 11,
    periodEmaSlow: 16,
    periodSignal: 8,
    stochPeriod: 12,
    stochSmaPeriod: 9,
    signalLife: 5,
    stopLoss: 4.94,
    takeProfit: 4.69,
    id: 4,
};
