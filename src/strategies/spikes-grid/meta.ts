import { geneticShutdownPlugin, ShutdownState } from '@debut/plugin-genetic-shutdown';
import { reportPlugin } from '@debut/plugin-report';
import { debugPlugin } from '@debut/plugin-debug';
import { createSessionValidator } from '@debut/plugin-session';
import { SpikesGOptions, SpikesG } from './bot';
import { StatsState } from '@debut/plugin-stats';
import { GeneticSchema, DebutMeta, BaseTransport, WorkingEnv } from '@debut/types';
import { StatsPluginAPI } from '@debut/plugin-stats';

const parameters: GeneticSchema<SpikesGOptions> = {
    takeProfit: { min: 1.5, max: 10 },
    step: { min: 0.5, max: 12 },
    levelsCount: { min: 3, max: 8, int: true },
    martingale: { min: 1, max: 2 },
    fibo: { bool: true },
    usePeaks: { bool: true },
    bandsPeriod: { min: 10, max: 80, int: true },
    barsTrend: { min: 10, max: 60, int: true },
    bandsDev: { min: 1, max: 4 },
    eventExpireBars: { min: 10, max: 80, int: true },
};

const shutdown = (stats: StatsState, state: ShutdownState) => {
    const totalOrders = stats.long + stats.short;

    if (!state.prevOrders && totalOrders < 5) {
        return true;
    }

    if (state.prevOrders && totalOrders - state.prevOrders < 5) {
        return true;
    }

    if (stats.maxMarginUsage > 10000) {
        return true;
    }

    state.prevOrders = totalOrders;

    return stats.relativeDD > 80 || stats.absoluteDD > 30;
};

const meta: DebutMeta = {
    parameters,

    score(bot: SpikesG) {
        const report = (bot.plugins as StatsPluginAPI).stats.report();

        if (bot.plugins.shutdown && bot.plugins.shutdown.isShutdown()) {
            return 0;
        }

        return report.expectation;
    },

    stats(bot: SpikesG) {
        return bot.plugins.stats.report();
    },

    async create(transport: BaseTransport, cfg: SpikesGOptions, env: WorkingEnv) {
        const bot = new SpikesG(transport, cfg);

        // Специфичные плагины окружения
        if (env === WorkingEnv.genetic) {
            bot.registerPlugins([geneticShutdownPlugin(cfg.interval, shutdown)]);
        } else if (env === WorkingEnv.tester) {
            bot.registerPlugins([reportPlugin()]);
            bot.plugins.report.addIndicators(bot.getIndicators());
        } else if (env === WorkingEnv.production) {
            bot.registerPlugins([debugPlugin()]);
            bot.opts.reduceEquity = true;
        }

        return bot;
    },

    ticksFilter(cfg: SpikesGOptions) {
        // Если не задана сессия не валидируем (Плавный переход на BTC/USDT)
        if (!cfg.from && !cfg.to) {
            return () => true;
        }

        const tickValidator = createSessionValidator(cfg.from, cfg.to, cfg.noTimeSwitching);

        return (tick) => {
            return tickValidator(tick.time).inSession;
        };
    },

    validate(cfg: SpikesGOptions) {
        if (cfg.takeProfit > cfg.step) {
            return false;
        }

        return cfg;
    },
};

export default meta;
