import { Debut } from '@debut/community-core';
import { Correlation } from '@debut/indicators';
import { math } from '@debut/plugin-utils';
import { BaseTransport, DebutOptions } from '@debut/types';

export class CorrelationMeter extends Debut {
    private corr: Correlation;
    private prev: string;

    constructor(transport: BaseTransport, opts: DebutOptions) {
        super(transport, opts);

        this.corr = new Correlation(12);
    }

    public updateBuyVolume(volume: number) {
        if (this.currentCandle?.c) {
            const corr = this.corr.nextValue(this.currentCandle.c, volume);
            if (!corr) {
                return 0;
            }

            return math.toFixed(corr, 3) || 0;
        }

        return 0;
    }
}
