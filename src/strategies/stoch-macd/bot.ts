import { Debut } from '@debut/community-core';
import { MACD, Stochastic } from '@debut/indicators';
import { BaseTransport, DebutOptions, Candle, OrderType } from '@debut/types';
import { virtualTakesPlugin, VirtualTakesOptions } from '@debut/plugin-virtual-takes';
import { StatsOptions, statsPlugin, StatsPluginAPI } from '@debut/plugin-stats';
import { ReportPluginAPI, IndicatorsSchema, FigureType } from '@debut/plugin-report';

// Strategy options description
export interface StochMacdOptions extends DebutOptions, VirtualTakesOptions, StatsOptions {
    periodEmaFast: number;
    periodEmaSlow: number;
    periodSignal: number;
    stochPeriod: number;
    stochSmaPeriod: number;
    signalLife: number;
}

export class StochMacd extends Debut {
    declare opts: StochMacdOptions;
    declare plugins: StatsPluginAPI & ReportPluginAPI;

    // MACD
    private macd: MACD;
    private macdValue: {
        macd: number;
        emaFast: number;
        emaSlow: number;
        signal: number;
        histogram: number;
    };

    // Stoch
    private stoch: Stochastic;
    private stochValue: {
        k: number;
        d: number;
    };

    private filled = false;
    private macdSignal: OrderType | null;
    private stochSignal: OrderType | null;
    private macdSignalCount = 0;
    private stochSignalCount = 0;

    constructor(transport: BaseTransport, opts: StochMacdOptions) {
        super(transport, opts);

        this.macd = new MACD(opts.periodEmaFast, opts.periodEmaSlow, opts.periodSignal);
        this.stoch = new Stochastic(opts.stochPeriod, opts.stochSmaPeriod);
        this.registerPlugins([virtualTakesPlugin(this.opts), statsPlugin(this.opts)]);
    }

    public getIndicators(): IndicatorsSchema {
        return [
            {
                name: 'macd indicator',
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
                            return this.macdValue?.histogram;
                        },
                    },
                ],
            },
            {
                name: 'stoch indicator',
                figures: [
                    {
                        name: 'k',
                        getValue: () => {
                            return this.stochValue?.k;
                        },
                    },
                    {
                        name: 'd',
                        getValue: () => {
                            return this.stochValue?.d;
                        },
                    },
                ],
            },
        ];
    }

    async onCandle(candle: Candle) {
        const prevStochValue = this.stochValue;
        const prevMacdValue = this.macdValue;

        this.macdValue = this.macd.nextValue(candle.c);
        this.stochValue = this.stoch.nextValue(candle.h, candle.l, candle.c);
        this.filled = this.filled || (!!this.macdValue?.signal && !!this.stochValue?.k);

        if (this.stochSignal) {
            this.stochSignalCount++;

            if (this.stochSignalCount > this.opts.signalLife) {
                this.stochSignal = null;
                this.stochSignalCount = 0;
            }
        }

        if (this.macdSignal) {
            this.macdSignalCount++;

            if (this.macdSignalCount > this.opts.signalLife) {
                this.macdSignal = null;
                this.macdSignalCount = 0;
            }
        }

        if (this.filled) {
            // Buy

            // MACD line is higher than MACD signal line
            const { macd: prevMacd } = prevMacdValue;
            const macdCrossBullish = prevMacd < this.macdValue.signal && this.macdValue.macd >= this.macdValue.signal;

            if (!this.macdSignal && macdCrossBullish) {
                this.macdSignal = OrderType.BUY;
                this.macdSignalCount = 0;
            }

            // Stochastic line K crosses line D, from bottom to top
            const { k, d } = this.stochValue;
            const { k: prevK } = prevStochValue;
            const stochCrossBullish = prevK <= d && k >= d;

            if (!this.stochSignal && stochCrossBullish) {
                // todo make fn create signal
                this.stochSignal = OrderType.BUY;
                this.stochSignalCount = 0;
            }

            // Sell

            // MACD line is below the MACD signal line
            const macdCrossBearish = prevMacd > this.macdValue.signal && this.macdValue.macd <= this.macdValue.signal;

            if (!this.macdSignal && macdCrossBearish) {
                this.macdSignal = OrderType.SELL;
                this.macdSignalCount = 0;
            }

            // Stochastic line K crosses line D, from top to bottom
            const stochCrossBearish = prevK >= d && k <= d;

            if (!this.stochSignal && stochCrossBearish) {
                this.stochSignal = OrderType.SELL;
                this.stochSignalCount = 0;
            }

            // Have no active orders and target exists
            if (this.stochSignal && this.stochSignal === this.macdSignal && !this.orders.length) {
                await this.createOrder(this.stochSignal);
                this.stochSignal = null;
                this.macdSignal = null;
                this.macdSignalCount = 0;
                this.stochSignalCount = 0;
            }
        }
    }
}
