import { geneticShutdownPlugin } from '@debut/plugin-genetic-shutdown';
import { reportPlugin } from '@debut/plugin-report';
import { debugPlugin } from '@debut/plugin-debug';
import { createSessionValidator } from '@debut/plugin-session';
import { CCIDynamic, CCIDynamicBotOptions } from './bot';
import { GeneticSchema, DebutMeta, BaseTransport, WorkingEnv } from '@debut/types';

const parameters: GeneticSchema<CCIDynamicBotOptions> = {
    stopTakeRatio: { min: 1, max: 4 },
    atrPeriod: { min: 8, max: 40, int: true },
    atrMultiplier: { min: 0.5, max: 10 },
    cciPeriod: { min: 8, max: 40, int: true },
    levelPeriod: { min: 4, max: 50, int: true },
    levelSampleType: { min: 1, max: 4, int: true },
    levelRedunant: { min: 0.25, max: 0.99 },
    levelSampleCount: { min: 1, max: 4, int: true },
    levelMultiplier: { min: 1, max: 2.5 },
    cciAtr: { bool: true },
    closeAtZero: { bool: true },
    orderCandlesLimit: { min: 10, max: 100, int: true },
    zeroClose: { bool: true },
    signalFilter: { bool: true },
    takeProfit: { min: 1, max: 10 },
    stopLoss: { min: 1, max: 10 },
    reduceWhen: { min: 1, max: 5 },
    reduceSize: { min: 0.2, max: 0.9 },
    trailing: { min: 0, max: 3, int: true },
};

const meta: DebutMeta = {
    parameters,

    score(bot: CCIDynamic) {
        const report = bot.plugins.stats.report();

        return report.balance - (report.maxBalance * report.potentialDD) / 100;
    },

    stats(bot: CCIDynamic) {
        return bot.plugins.stats.report();
    },

    async create(transport: BaseTransport, cfg: CCIDynamicBotOptions, env: WorkingEnv) {
        const bot = new CCIDynamic(transport, cfg);

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

    ticksFilter(cfg: CCIDynamicBotOptions) {
        if (!cfg.from && !cfg.to) {
            return () => true;
        }

        const tickValidator = createSessionValidator(cfg.from, cfg.to, cfg.noTimeSwitching);

        return (tick) => {
            return tickValidator(tick.time).inSession;
        };
    },

    validate(cfg: CCIDynamicBotOptions) {
        return cfg;
    },
};

export default meta;
