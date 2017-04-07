import {redirectTo} from '~/shared/utils'
import {mountClient} from '~/shared/test/test-helpers.jsx'

describe.only('Take Food', () => {
  it('Takes food', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A
`);
    clientStore0.dispatch(redirectTo('game'));
    clientStore1.dispatch(redirectTo('game'));
    const $client0 = mountClient(clientStore0);
    const dndBackend0 = $client0.find('DragDropContext(GameWrapper)').get(0).getManager().getBackend();
    const $client1 = mountClient(clientStore1);
    const dndBackend1 = $client1.find('DragDropContext(GameWrapper)').get(0).getManager().getBackend();

    mount(<div>B<span></span></div>).children();
    //console.log($client0.find('CardCollection').debug())

    //console.log($client0.find('CardCollection').filterWhere(c => c.prop('name') === 'Hand').debug())
    //console.log($client0.find('.UserWrapper').find('Animal').filterWhere(a => a.prop('model').id === '$A').parent().debug())

    //console.log($client0.find('.UserWrapper').find('.Animal').parents())

    console.log($client0.find('Provider').parent().debug())
    //console.log($client0.instance().getPublicInstance)
  });
});