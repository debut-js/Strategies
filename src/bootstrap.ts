import { BinanceTransport, TinkoffTransport } from '@debut/community-core';
import { cli } from '@debut/plugin-utils';
import { DebutOptions, WorkingEnv } from '@debut/types';
import { SpikesGOptions } from './strategies/spikes-grid/bot';

// Создадим транспортный уровень для работы с брокером
// Обратите внимание! Требуется наличие токена в файле ./.tokens.json
const binanceTransport = new BinanceTransport();
// const tinkoffTransport = new TinkoffTransport();

const getTransport = (cfg: DebutOptions) => {
    if (cfg.broker === 'binance') {
        return binanceTransport;
        // } else {
        //     return tinkoffTransport;
    }
};

const bootSettings = {
    // Выбираем стратегию
    strategyName: 'SpikesG',
    // Выбираем нужный тикер, который существует в файле cfgs.ts
    tickName: 'BTCUSDT',
    // Выбираем кол-во дней для обучения
    learnDays: 14,
};

// Главная функция запуска торговой стратегии
async function bootstrap() {
    // Запросим мета информацию для создания бота на основе стратегии SpikesG, по его имени в фалйе schema.json
    // А также доступные конфигурации стратегии из файлов cfgs.ts
    const { meta, configs }: cli.BotData = cli.getBotData(bootSettings.strategyName);

    // Если конфигурации не существует - выбрасываем
    if (!configs[bootSettings.tickName]) {
        console.log(`${bootSettings.tickName} not found in cfgs.ts. Shutdowning...`);
        return process.exit(0);
    }

    // Заберем нужное поле из доступных конфигураций
    const config = configs[bootSettings.tickName] as SpikesGOptions;
    // Создание робота в режиме Production
    const bot = await meta.create(getTransport(config), config, WorkingEnv.production);

    // Запустим предстартовое обучение стратегии, для плавного перехода в боевой режим,
    // на $(bootSettings.learnDays)[14] днях истории до текущего момента
    await bot.learn(bootSettings.learnDays);

    console.log('Bot initialized and learned, starting...');

    // Подписка на данные от биржи в реальном времени для работы
    // Вызов метода start, возвращает функцию для остановки, которая при вызове удалит стратегию и закроет активные позиции по ней
    const dispose = await bot.start();

    // Остановка торговли
    // dispose()
}

// Запуск
bootstrap();
