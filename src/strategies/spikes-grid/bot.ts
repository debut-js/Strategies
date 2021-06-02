import { SessionPluginOptions, sessionPlugin } from '@debut/plugin-session';
import { reinvestPlugin } from '@debut/plugin-reinvest';
import { ReportPluginAPI, IndicatorsSchema } from '@debut/plugin-report';
import { statsPlugin, StatsPluginAPI } from '@debut/plugin-stats';
import { ShutdownPluginAPI } from '@debut/plugin-genetic-shutdown';
import { gridPlugin, GridPluginOptions } from '@debut/plugin-grid';
import { BollingerBands } from '@debut/indicators';
import { DebutOptions, Candle, BaseTransport, OrderType } from '@debut/types';
import { Debut } from '@debut/community-core';

export interface SpikesGOptions extends DebutOptions, SessionPluginOptions, GridPluginOptions {
    bandsPeriod: number;
    bandsDev: number;
    usePeaks: boolean;
    barsTrend: number; // сколько свечей без касаний для наличия тренда
    eventExpireBars: number; // баров на истечение ивента
    reinvest?: boolean;
    buyOnly: boolean;
    useClose: boolean;
}

type BBands = { middle: number; upper: number; lower: number };

export class SpikesG extends Debut {
    declare opts: SpikesGOptions;
    declare plugins: StatsPluginAPI & ReportPluginAPI & ShutdownPluginAPI;
    private bands: BollingerBands;
    private bandsValue: BBands;
    private events = '';
    private lowPriceGetter: (candle: Candle) => number;
    private highPriceGetter: (candle: Candle) => number;
    private barsWithoutBottom = 0;
    private barsWithoutTop = 0;
    private expirationBars = 0;

    constructor(transport: BaseTransport, opts: SpikesGOptions) {
        super(transport, opts);

        this.registerPlugins([
            this.opts.from && this.opts.to && sessionPlugin(this.opts),
            this.opts.reinvest ? reinvestPlugin() : null,
            statsPlugin(this.opts),
            gridPlugin(this.opts),
        ]);

        this.bands = new BollingerBands(this.opts.bandsPeriod, this.opts.bandsDev);

        if (this.opts.usePeaks) {
            this.lowPriceGetter = (candle) => candle.l;
            this.highPriceGetter = (candle) => candle.h;
        } else {
            this.highPriceGetter = this.lowPriceGetter = (candle) => candle.c;
        }
    }

    public getIndicators = (): IndicatorsSchema => {
        return [
            {
                name: 'bbands',
                lines: [
                    {
                        name: 'upper',
                        getValue: () => {
                            return this.bandsValue?.upper;
                        },
                    },
                    {
                        name: 'middle',
                        getValue: () => {
                            return this.bandsValue?.middle;
                        },
                    },
                    {
                        name: 'lower',
                        getValue: () => {
                            return this.bandsValue?.lower;
                        },
                    },
                ],
                color: 'red',
                levels: [],
                inChart: true,
            },
        ];
    };

    async onCandle(candle: Candle) {
        if (!this.prevCandle) {
            return;
        }

        const bbands = this.bands.nextValue(candle.c);
        this.bandsValue = bbands;

        if (!this.bandsValue) {
            return;
        }

        const prevEvents = this.events;
        const prevLow = this.lowPriceGetter(this.prevCandle);
        const low = this.lowPriceGetter(candle);
        const high = this.highPriceGetter(candle);
        const prevHigh = this.highPriceGetter(this.prevCandle);

        this.barsWithoutBottom++;
        this.barsWithoutTop++;
        this.expirationBars++;

        if (this.expirationBars > this.opts.eventExpireBars) {
            this.events = this.events.slice(-2);
        }

        if (candle.c < bbands.lower) {
            this.barsWithoutBottom = 0;
        }

        if (candle.c > bbands.upper) {
            this.barsWithoutTop = 0;
        }

        if (prevLow > bbands.lower && low < bbands.lower) {
            // Ксание тенью свечи низа
            this.addEvent('A');
        } else if (prevHigh < bbands.upper && high > bbands.upper) {
            // Касание тенью свечи верха
            this.addEvent('C');
        } else if (
            // Проход через середину снизу вверх
            (this.prevCandle.c < bbands.middle && candle.c > bbands.middle) ||
            // Проход через середину сверху вниз
            (this.prevCandle.c > bbands.middle && candle.c < bbands.middle)
        ) {
            this.addEvent('B');
        }

        if (this.events !== prevEvents) {
            await this.openMonitoring();
        }
    }

    async openMonitoring() {
        if (!this.events) {
            return;
        }

        let target: OrderType;
        const isUpTrend = this.barsWithoutBottom > this.opts.barsTrend;
        const isDownTrend = this.barsWithoutTop > this.opts.barsTrend;
        const middleUp = isUpTrend && this.prevCandle.l <= (this.bandsValue.upper + this.bandsValue.middle) / 2;
        const middleDown = isDownTrend && this.prevCandle.l >= (this.bandsValue.lower + this.bandsValue.middle) / 2;

        if (middleUp) {
            // Откат к середине в случае с сильным трендом
            target = OrderType.BUY;
        } else if (middleDown) {
            // Откат к середине в случае с сильным трендом
            target = OrderType.SELL;
        } else if (this.events === 'ABC') {
            // ABC - касание снизу проход через середину касание сверху
            target = OrderType.SELL;
        } else if (this.events === 'ABA') {
            // ABA - касание снизу касание середины касание снизу
            target = OrderType.BUY;
        } else if (this.events === 'CBA') {
            // CBA - касание верха проход через середину касание низа
            target = OrderType.BUY;
        } else if (this.events === 'CBC') {
            // CBC - касание верха касание середины касание верха
            target = OrderType.SELL;
        }

        if (target) {
            this.events = this.events.slice(-2);
        } else {
            return;
        }

        const activeOrder = this.orders[0];

        if (activeOrder && target !== activeOrder.type && this.opts.useClose) {
            await this.closeOrder(activeOrder);
        }

        if (this.opts.buyOnly && target === OrderType.SELL) {
            return;
        }

        if (!this.orders.length) {
            await this.createOrder(target);
        }
    }

    private addEvent(event: 'A' | 'B' | 'C') {
        this.events = this.events.slice(-2) + event;
    }
}
