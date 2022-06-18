import { TinkoffTransport } from '@debut/community-core';
import { cli } from '@debut/plugin-utils';
const { tinkoff } = cli.getTokens();

new TinkoffTransport(tinkoff, 'asd').api.users.getAccounts({}).then(res => {
    console.log(res.accounts.find(account => account.type === 1).id);
});
