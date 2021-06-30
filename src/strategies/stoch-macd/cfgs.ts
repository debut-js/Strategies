import { StochMacdOptions } from './bot';

export const TSLA: StochMacdOptions = {
    broker: 'alpaca',
    ticker: 'TSLA',
    currency: 'USD',
    interval: '1h',
    amount: 1000,
    stopLoss: 3.93,
    takeProfit: 4.78,
    periodEmaFast: 9,
    periodEmaSlow: 16,
    periodSignal: 10,
    stochPeriod: 19,
    stochSmaPeriod: 12,
    signalLife: 5,
    id: 4,
};
