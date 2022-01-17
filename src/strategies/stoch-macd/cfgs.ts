import { StochMacdOptions } from './bot';

export const ETHUSDT: StochMacdOptions = {
    instrumentType: 'SPOT',
    fee: 0.0003,
    lotsMultiplier: 1,
    equityLevel: 1,
    broker: 'binance',
    ticker: 'ETHUSDT',
    currency: 'USDT',
    interval: '15min',
    amount: 500,
    stopLoss: 3.78,
    takeProfit: 3.87,
    periodEmaFast: 14,
    periodEmaSlow: 16,
    periodSignal: 5,
    stochPeriod: 25,
    stochSmaPeriod: 8,
    signalLife: 1,
    id: 4,
};

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
