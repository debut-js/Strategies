import { BinanceTransport, TinkoffTransport, AlpacaTransport } from '@debut/community-core';
import { cli } from '@debut/plugin-utils';
import { BaseTransport, DebutOptions, WorkingEnv } from '@debut/types';
import { SpikesGOptions } from './strategies/spikes-grid/bot';

// Create a transport layer for working with a broker
// Note! The token is required in the ./.tokens.json file
const { binance, binanceSecret, tinkoff, tinkoffAccountId, alpacaKey, alpacaSecret } = cli.getTokens();

const transportCache: Map<string, BaseTransport> = new Map();

// Tinkoff get accounts list example
// tinkoffTransport['api'].users.getAccounts({}).then(res => {
//     console.log(res);
// });

const getTransport = (cfg: DebutOptions) => {
    let transport = transportCache.get(cfg.broker);

    if (!transport) {
        transport = createTransport(cfg.broker);
        transportCache.set(cfg.broker, transport);
    }

    return transport;
};

const createTransport = (broker: string) => {
    if (broker === 'binance') {
        return new BinanceTransport(binance, binanceSecret);
    } else if (broker === 'tinkoff') {
        return new TinkoffTransport(tinkoff, tinkoffAccountId);
    } else if (broker === 'alpaca') {
        return new AlpacaTransport(alpacaKey, alpacaSecret);
    }
};

const bootSettings = {
    // Choose a strategy
    strategyName: 'FTBot',
    // Select a ticker, which exists in the cfgs.ts file
    tickName: 'EGLDUSDT',
    // Choose the number of days for training
    learnDays: 0,
};

// Main function for launching a trading strategy
async function bootstrap() {
    // Request meta information to create a bot based on the SpikesG strategy, by its name in the schema.json file
    // And also available strategy configurations from cfgs.ts files
    const { meta, configs }: cli.BotData = await cli.getBotData(bootSettings.strategyName);

    // If the configuration does not exist, throw it away
    if (!configs[bootSettings.tickName]) {
        console.log(`${bootSettings.tickName} not found in cfgs.ts. Shutdowning...`);
        return process.exit(0);
    }

    // Take the required field from the available configurations
    const config = configs[bootSettings.tickName] as SpikesGOptions;
    // Create a robot in Production mode
    const bot = await meta.create(getTransport(config), config, WorkingEnv.production);

    if (bootSettings.learnDays) {
        // Start prelaunch strategy training, for a smooth transition to combat mode,
        // at $(bootSettings.learnDays)[14] days of history until the current moment
        await bot.learn(bootSettings.learnDays);
    }

    console.log('\nBot initialized and learned, starting...');

    // Subscribe to data from the exchange in real time to work
    // Calling the start method, returns the stop function, which, when called,
    // will delete the strategy and close active positions on it
    const dispose = await bot.start();

    // Stop trading
    // dispose()
}

// Good Luck 🍀
bootstrap();
