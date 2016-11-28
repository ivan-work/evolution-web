import React from 'react'
import {redirectTo} from '~/shared/utils'
import {mountClient} from '~/shared/test/test-helpers.jsx'

import {selectFood, selectDTAnimal, selectHID} from '../test.selectors';

describe('Take Food', () => {
  it('Takes food', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
food: 5
players:
  - continent: $A
`);
    clientStore0.dispatch(redirectTo('game'));
    clientStore1.dispatch(redirectTo('game'));
    const $client0 = mountClient(clientStore0);
    const dndBackend0 = $client0.find('DragDropContext(GameWrapper)').get(0).getManager().getBackend();
    const $client1 = mountClient(clientStore1);
    const dndBackend1 = $client1.find('DragDropContext(GameWrapper)').get(0).getManager().getBackend();

    expect($client0.find('DragSource(Food)')).length(5);
    expect(selectFood($client0).find('Food').prop('canDrag')).true;
    expect(selectFood($client1).find('Food').prop('canDrag')).false;

    dndBackend0.simulateBeginDrag([selectHID(selectFood($client0))]);
    expect(selectFood($client0).find('Food').prop('isDragging')).true;
    dndBackend0.simulateHover([selectHID(selectDTAnimal($client0, '$A'))]);
    dndBackend0.simulateDrop();
    dndBackend0.simulateEndDrag();

    expect(selectDTAnimal($client0, '$A').prop('model').getFood()).equal(1);
    expect(selectDTAnimal($client1, '$A').prop('model').getFood()).equal(1);

    expect(selectDTAnimal($client0, '$A').find('Food')).length(1);
    expect(selectDTAnimal($client1, '$A').find('Food')).length(1);

    $client0.unmount();
    $client1.unmount();
  });
});