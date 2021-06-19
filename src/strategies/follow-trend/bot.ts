import { SMA } from '@debut/indicators';
import { SessionPluginOptions, sessionPlugin } from '@debut/plugin-session';
import { VirtualTakesOptions, virtualTakesPlugin } from '@debut/plugin-virtual-takes';
import { ReportPluginAPI, IndicatorsSchema } from '@debut/plugin-report';
import { statsPlugin, StatsPluginAPI } from '@debut/plugin-stats';
import { ShutdownPluginAPI } from '@debut/plugin-genetic-shutdown';
import { Debut } from '@debut/community-core';
import { math } from '@debut/plugin-utils';
import { DebutOptions, BaseTransport, OrderType, Candle } from '@debut/types';

export interface FTOptions extends DebutOptions, SessionPluginOptions, VirtualTakesOptions {
    fastPeriod: number;
    slowPeriod: number;
    openPercent: number;
}
export class FTBot extends Debut {
    declare opts: FTOptions;
    declare plugins: StatsPluginAPI & ReportPluginAPI & ShutdownPluginAPI;

    private sma: SMA;
    private slowSMA: SMA;
    private fastSmaResult: number[] = [];
    private slowSmaResult: number[] = [];
    private allowOrders = true;

    constructor(transport: BaseTransport, opts: FTOptions) {
        super(transport, opts);

        this.sma = new SMA(this.opts.fastPeriod);
        this.slowSMA = new SMA(this.opts.slowPeriod);

        this.registerPlugins([
            this.opts.from && this.opts.to && sessionPlugin(this.opts),
            virtualTakesPlugin(this.opts),
            statsPlugin(this.opts),
        ]);
    }

    public getIndicators = (): IndicatorsSchema => {
        return [
            {
                name: 'ft',
                figures: [
                    {
                        name: 'fast',
                        getValue: () => {
                            return this.fastSmaResult[0];
                        },
                    },
                    {
                        name: 'slow',
                        getValue: () => {
                            return this.slowSmaResult[0];
                        },
                    },
                ],
                inChart: true,
            },
        ];
    };

    async openMonitoring(fastSMA?: number[], slowSMA?: number[]) {
        const percent = Math.abs(math.percentChange(fastSMA[0], slowSMA[0]));
        const order = this.orders[0];

        if (percent < 1) {
            this.allowOrders = true;
        }

        if (
            fastSMA[0] > fastSMA[1] &&
            slowSMA[0] > slowSMA[1] &&
            fastSMA[0] > slowSMA[0] &&
            percent >= this.opts.openPercent &&
            this.allowOrders &&
            !order
        ) {
            await this.createOrder(OrderType.SELL);
            this.allowOrders = false;
        }

        if (
            fastSMA[0] < fastSMA[1] &&
            slowSMA[0] < slowSMA[1] &&
            fastSMA[0] < slowSMA[0] &&
            percent >= this.opts.openPercent &&
            !order &&
            this.allowOrders
        ) {
            await this.createOrder(OrderType.BUY);
            this.allowOrders = false;
        }
    }

    async onCandle({ c }: Candle) {
        try {
            // Проверяем статус активного ордера, только на закрытие свечи
            const fastSMA = this.getFastSMA(c);
            const slowSMA = this.getSlowSMA(c);

            // this.indicators = { fastSMA: fastSMA, slowSMA: slowSMA };
            await this.openMonitoring(fastSMA, slowSMA);
        } catch (e) {
            console.log(this.getName(), e);
        }
    }

    private getFastSMA(value: number) {
        this.fastSmaResult.unshift(this.sma.nextValue(value));

        if (this.fastSmaResult.length === 3) {
            this.fastSmaResult.splice(-1);
        }

        return this.fastSmaResult;
    }

    private getSlowSMA(value: number) {
        this.slowSmaResult.unshift(this.slowSMA.nextValue(value));

        if (this.slowSmaResult.length === 3) {
            this.slowSmaResult.splice(-1);
        }

        return this.slowSmaResult;
    }
}
