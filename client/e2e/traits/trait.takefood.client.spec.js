import {redirectTo} from '~/shared/utils'
import {mountClient} from '~/shared/test/test-helpers.jsx'

describe.only('Take Food', () => {
  it('Takes food', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 1
players:
  - hand: CardCommunication
`);
    clientStore0.dispatch(redirectTo('game'));
    clientStore1.dispatch(redirectTo('game'));
    const $client0 = mountClient(clientStore0);
    const $client1 = mountClient(clientStore1);
    console.log($client0.find('Hand').debug())
  });
});