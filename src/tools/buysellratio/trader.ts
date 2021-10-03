import { Debut } from '@debut/community-core';
import { BaseTransport, DebutOptions, ExecutedOrder, OrderType } from '@debut/types';
import { statsPlugin, StatsPluginAPI } from '@debut/plugin-stats';
import { virtualTakesPlugin } from '@debut/plugin-virtual-takes';

export class Trader extends Debut {
    declare plugins: StatsPluginAPI;

    constructor(transpoprt: BaseTransport, opts: DebutOptions, private log: (string: string, stream: string) => void) {
        super(transpoprt, opts);

        this.registerPlugins([statsPlugin(this.opts), virtualTakesPlugin({ takeProfit: 0.5, stopLoss: 0.25 })]);
    }

    async onOrderOpened(order: ExecutedOrder) {
        this.log(`${order.type} at price: ${order.price}`, 'deals');
    }

    async onOrderClosed(order: ExecutedOrder, closing: ExecutedOrder) {
        this.log(`${closing.type} closed. ${order.openPrice} ➡ ${order.price}`, 'deals');

        const state = this.plugins.stats.report();

        this.log(
            `Total Profit: ${state.profit}\
            \nMaxRelDD: ${state.relativeDD}\
            \nMaxAbsDD: ${state.absoluteDD}\
            \nPercent Win: ${state.profitProb}\
            \nMath Expectation: ${state.expectation}`,
            'stats',
        );
    }
}
