import { BaseTransport, DebutMeta, GeneticSchema, WorkingEnv } from '@debut/types';
import { StochMacdOptions, StochMacd } from './bot';
import { reportPlugin } from '@debut/plugin-report';

const parameters: GeneticSchema<StochMacdOptions> = {
    // macd
    periodEmaFast: { min: 5, max: 16, int: true },
    periodEmaSlow: { min: 8, max: 25, int: true },
    periodSignal: { min: 5, max: 14, int: true },

    // stoch
    stochPeriod: { min: 5, max: 25, int: true },
    stochSmaPeriod: { min: 5, max: 12, int: true },

    signalLife: { min: 1, max: 5, int: true },

    stopLoss: { min: 0.2, max: 5 },
    takeProfit: { min: 0.2, max: 5 },
};
const create = async (transport: BaseTransport, cfg: StochMacdOptions, env: WorkingEnv): Promise<StochMacd> => {
    const bot = new StochMacd(transport, cfg);

    if (env === WorkingEnv.tester) {
        bot.registerPlugins([reportPlugin(false)]);
        bot.plugins.report.addIndicators(bot.getIndicators());
    }

    return bot;
};
const score = (bot: StochMacd) => bot.plugins.stats.report().expectation;
const validate = (cfg: StochMacdOptions): false | StochMacdOptions => {
    // fast should be less than slow period
    if (cfg.periodEmaFast > cfg.periodEmaSlow) {
        return false;
    }

    // Stop always should be lower than take
    if (cfg.stopLoss > cfg.takeProfit) {
        return false;
    }

    return cfg;
};
const stats = (bot: StochMacd) => bot.plugins.stats.report();

const meta: DebutMeta = {
    parameters,
    create,
    score,
    validate,
    stats,
};

export default meta;
