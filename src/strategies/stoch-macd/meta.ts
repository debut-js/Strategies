import { BaseTransport, DebutMeta, GeneticSchema, WorkingEnv } from '@debut/types';
import { StochMacdOptions, StochMacd } from './bot';
import { reportPlugin } from '@debut/plugin-report';
// lets describe meta file

const parameters: GeneticSchema<StochMacdOptions> = {
    periodEmaFast: { min: 5, max: 16, int: true },
    periodEmaSlow: { min: 8, max: 25, int: true },
    periodSignal: { min: 5, max: 14, int: true },
    stochPeriod: { min: 5, max: 25, int: true },
    stochSmaPeriod: { min: 5, max: 12, int: true },
    signalLife: { min: 1, max: 5, int: true },
    stopLoss: { min: 0.2, max: 5 },
    takeProfit: { min: 0.2, max: 5 },
};

const score = (bot: StochMacd) => {
    const stats = bot.plugins.stats.report();

    // Math expectation as score factor
    return stats.expectation;
};

const validate = (cfg: StochMacdOptions) => {
    // always valid
    if (cfg.periodEmaFast > cfg.periodEmaSlow) {
        return false;
    }

    return cfg;
};

// stats getter
const stats = (bot: StochMacd) => bot.plugins.stats.report();

// Create strategy instance for different environments
const create = async (transport: BaseTransport, cfg: StochMacdOptions, env: WorkingEnv) => {
    const bot = new StochMacd(transport, cfg);

    if (env === WorkingEnv.tester) {
        bot.registerPlugins([reportPlugin(false)]);
        bot.plugins.report.addIndicators(bot.getIndicators());
    }

    return bot;
};

const meta: DebutMeta = {
    parameters,
    score,
    validate,
    stats,
    create,
};

export default meta;
