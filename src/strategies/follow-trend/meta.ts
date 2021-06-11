import { geneticShutdownPlugin } from '@debut/plugin-genetic-shutdown';
import { reportPlugin } from '@debut/plugin-report';
import { debugPlugin } from '@debut/plugin-debug';
import { createSessionValidator } from '@debut/plugin-session';
import { FTBot, FTOptions } from './bot';
import { BaseTransport, DebutMeta, GeneticSchema, WorkingEnv } from '@debut/types';

export const parameters = {
    stopLoss: { min: 0.2, max: 9 },
    takeProfit: { min: 0.2, max: 9 },
    openPercent: { min: 1, max: 15 },
    fastSMAPeriod: { min: 2, max: 30, int: true },
    slowSMAPeriod: { min: 10, max: 30, int: true },
};

const meta: DebutMeta = {
    parameters,

    score(bot: FTBot) {
        const report = bot.plugins.stats.report();

        if (bot.plugins.shutdown && bot.plugins.shutdown.isShutdown()) {
            return 0;
        }

        return report.expectation;
    },

    stats(bot: FTBot) {
        return bot.plugins.stats.report();
    },

    async create(transport: BaseTransport, cfg: FTOptions, env: WorkingEnv) {
        const bot = new FTBot(transport, cfg);

        // Специфичные плагины окружения
        if (env === WorkingEnv.genetic) {
            bot.registerPlugins([geneticShutdownPlugin(cfg.interval)]);
        } else if (env === WorkingEnv.tester) {
            bot.registerPlugins([reportPlugin(false)]);
            bot.plugins.report.addIndicators(bot.getIndicators());
        } else if (env === WorkingEnv.production) {
            bot.registerPlugins([debugPlugin()]);
        }

        return bot;
    },

    ticksFilter(cfg: FTOptions) {
        if (!cfg.from && !cfg.to) {
            return () => true;
        }

        const tickValidator = createSessionValidator(cfg.from, cfg.to, cfg.noTimeSwitching);

        return (tick) => {
            return tickValidator(tick.time).inSession;
        };
    },

    validate(cfg: FTOptions) {
        if (cfg.fastPeriod > cfg.slowPeriod) {
            return false;
        }

        return cfg;
    },
};

export default meta;
