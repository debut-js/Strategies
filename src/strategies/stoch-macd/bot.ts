import { Debut } from '@debut/community-core';
import { MACD, Stochastic } from '@debut/indicators';
import { BaseTransport, Candle, DebutOptions, OrderType } from '@debut/types';
import { virtualTakesPlugin, VirtualTakesOptions } from '@debut/plugin-virtual-takes';
import { FigureType, ReportPluginAPI } from '@debut/plugin-report';
import { statsPlugin, StatsPluginAPI } from '@debut/plugin-stats';

export interface StochMacdOptions extends DebutOptions, VirtualTakesOptions {
    // macd
    periodEmaFast: number;
    periodEmaSlow: number;
    periodSignal: number;

    // stoch
    stochPeriod: number;
    stochSmaPeriod: number;

    signalLife: number;
}

// I Built A Crypto/Stock Trading Bot in 45 minutes with "Debut"
// https://www.youtube.com/watch?v=KBHzN3ZvxSc
export class StochMacd extends Debut {
    declare opts: StochMacdOptions;
    declare plugins: ReportPluginAPI & StatsPluginAPI;

    // MACD setup
    private macd: MACD;
    private macdValue: {
        macd: number;
        emaFast: number;
        emaSlow: number;
        signal: number;
        histogram: number;
    };

    // Sotchastic setup
    private stoch: Stochastic;
    private stochValue: {
        k: number;
        d: number;
    };

    // strategy fields
    private filled: number;
    private macdSignal: OrderType | null = null;
    private macdSignalBars = 0;

    private stochSignal: OrderType | null = null;
    private stochSignalBars = 0;

    constructor(transport: BaseTransport, opts: StochMacdOptions) {
        super(transport, opts);

        this.macd = new MACD(opts.periodEmaFast, opts.periodEmaSlow, opts.periodSignal);
        this.stoch = new Stochastic(opts.stochPeriod, opts.stochSmaPeriod);

        this.registerPlugins([virtualTakesPlugin(opts), statsPlugin(opts)]);
    }

    public getIndicators() {
        return [
            {
                name: 'MACD Indicator',
                figures: [
                    {
                        name: 'macd',
                        getValue: () => {
                            return this.macdValue?.macd;
                        },
                    },
                    {
                        name: 'signal',
                        getValue: () => {
                            return this.macdValue?.signal;
                        },
                    },
                    {
                        name: 'histogram',
                        type: FigureType.bar,
                        getValue: () => {
                            return this.macdValue?.signal;
                        },
                    },
                ],
            },
            {
                name: 'Stoch Indicator',
                figures: [
                    {
                        name: 'K',
                        getValue: () => {
                            return this.stochValue?.k;
                        },
                    },
                    {
                        name: 'D',
                        getValue: () => {
                            return this.stochValue?.d;
                        },
                    },
                ],
            },
        ];
    }

    async onCandle(candle: Candle) {
        const prevMacdValue = this.macdValue;
        const prevStochValue = this.stochValue;

        this.macdValue = this.macd.nextValue(candle.c);
        this.stochValue = this.stoch.nextValue(candle.h, candle.l, candle.c);

        this.filled = this.filled || (this.macdValue?.signal && this.stochValue?.k);

        this.validateMacdSignal();
        this.validateStochSignal();

        if (!this.filled) {
            return;
        }

        const { k, d } = this.stochValue;
        const { macd, signal } = this.macdValue;

        // Buy zone
        // 1. Macd line crosses the signal line from bottom to top
        const { macd: prevMacd } = prevMacdValue;
        const macdCrossBullish = prevMacd < signal && macd >= signal;

        if (!this.macdSignal && macdCrossBullish) {
            this.createMacdSignal(OrderType.BUY);
        }

        // 2. Stochastic line K crosses line D, from  bottom to top
        const { k: prevK } = prevStochValue;
        const stochCrossBullish = prevK <= d && k >= d;

        if (!this.stochSignal && stochCrossBullish) {
            this.createStochSignal(OrderType.BUY);
        }

        // Sell zone
        // 1. Macd line crosses the signal line from top to bottom
        const macdCrossBearish = prevMacd > signal && macd <= signal;

        if (!this.macdSignal && macdCrossBearish) {
            this.createMacdSignal(OrderType.SELL);
        }

        // 2. Stochastic line K crosses line D, from top to bottom
        const stochCrossBearish = prevK > d && k <= d;

        if (!this.stochSignal && stochCrossBearish) {
            this.createStochSignal(OrderType.SELL);
        }

        if (this.macdSignal && this.macdSignal === this.stochSignal && !this.orders.length) {
            await this.createOrder(this.macdSignal);
        }
    }

    private validateMacdSignal() {
        if (this.macdSignal) {
            this.macdSignalBars++;

            if (this.macdSignalBars > this.opts.signalLife) {
                this.macdSignalBars = 0;
                this.macdSignal = null;
            }
        }
    }

    private validateStochSignal() {
        if (this.stochSignal) {
            this.stochSignalBars++;

            if (this.stochSignalBars > this.opts.signalLife) {
                this.stochSignalBars = 0;
                this.stochSignal = null;
            }
        }
    }

    private createMacdSignal(type: OrderType) {
        this.macdSignal = type;
        this.macdSignalBars = 0;
    }

    private createStochSignal(type: OrderType) {
        this.stochSignal = type;
        this.stochSignalBars = 0;
    }
}
