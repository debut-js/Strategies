import { Debut } from '@debut/community-core';
import { BaseTransport, DebutOptions, Depth } from '@debut/types';

export class BuySellMeter extends Debut {
    // 2 seconds
    private intervalMs = 2000;
    private snapshotTime = Date.now() + this.intervalMs;
    private buyState = 0;
    private sellState = 0;

    constructor(
        transport: BaseTransport,
        opts: DebutOptions,
        private callback: (buyVolume: number, sellVolume: number) => void,
    ) {
        super(transport, opts);
    }

    async onDepth(depth: Depth) {
        const now = Date.now();

        depth.asks.forEach((item) => {
            this.sellState += item.qty;
        });

        depth.bids.forEach((item) => {
            this.buyState += item.qty;
        });

        if (now > this.snapshotTime) {
            this.snapshotTime = now + this.intervalMs;
            this.callback(this.buyState, this.sellState);
            this.buyState = 0;
            this.sellState = 0;
        }
    }
}
