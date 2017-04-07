import React from 'react'
import {redirectTo} from '~/shared/utils'
import {mountClient} from '~/shared/test/test-helpers.jsx'

import {selectHID, selectCard, selectUser, selectUserAnimal, selectAnimal} from './test.selectors';

describe('e2e Deploy', () => {
  it('Can deploy animal', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 1
players:
  - hand: camo
`);
    clientStore0.dispatch(redirectTo('game'));
    clientStore1.dispatch(redirectTo('game'));
    const $client0 = mountClient(clientStore0);
    const dndBackend0 = $client0.find('DragDropContext(GameWrapper)').get(0).getManager().getBackend();
    const $client1 = mountClient(clientStore1);
    const dndBackend1 = $client1.find('DragDropContext(GameWrapper)').get(0).getManager().getBackend();

    expect(selectCard($client0, 0).find('Card').prop('canDrag')).true;

    dndBackend0.simulateBeginDrag([selectHID(selectCard($client0, 0))]);
    expect(selectCard($client0, 0).find('Card').prop('isDragging')).true;
    dndBackend0.simulateHover([selectHID($client0.find('DropTarget(ContinentZone)'))]);
    dndBackend0.simulateDrop();
    dndBackend0.simulateEndDrag();

    expect(selectCard($client0, 0)).length(0);
    expect(selectUserAnimal($client0, User0, 0)).length(1);

    $client0.unmount();
    $client1.unmount();
  });

  it('Can deploy simple trait', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 1
players:
  - hand: camo
    continent: $A
`);
    clientStore0.dispatch(redirectTo('game'));
    clientStore1.dispatch(redirectTo('game'));
    const $client0 = mountClient(clientStore0);
    const dndBackend0 = $client0.find('DragDropContext(GameWrapper)').get(0).getManager().getBackend();
    const $client1 = mountClient(clientStore1);
    const dndBackend1 = $client1.find('DragDropContext(GameWrapper)').get(0).getManager().getBackend();

    expect(selectCard($client0, 0).find('Card').prop('canDrag')).true;

    dndBackend0.simulateBeginDrag([selectHID(selectCard($client0, 0))]);
    expect(selectCard($client0, 0).find('Card').prop('isDragging')).true;
    dndBackend0.simulateHover([selectHID(selectAnimal($client0, '$A'))]);
    dndBackend0.simulateDrop();
    dndBackend0.simulateEndDrag();

    expect(selectCard($client0, 0)).length(0);
    expect(selectUserAnimal($client0, User0, 0)).length(1);

    $client0.unmount();
    $client1.unmount();
  });

  it('Can deploy linked trait', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 1
players:
  - hand: commu
    continent: $A, $B
`);
    clientStore0.dispatch(redirectTo('game'));
    clientStore1.dispatch(redirectTo('game'));
    const $client0 = mountClient(clientStore0);
    const dndBackend0 = $client0.find('DragDropContext(GameWrapper)').get(0).getManager().getBackend();
    const $client1 = mountClient(clientStore1);
    const dndBackend1 = $client1.find('DragDropContext(GameWrapper)').get(0).getManager().getBackend();

    expect(selectCard($client0, 0).find('Card').prop('canDrag')).true;

    dndBackend0.simulateBeginDrag([selectHID(selectCard($client0, 0))]);
    expect(selectCard($client0, 0).find('Card').prop('isDragging')).true;
    dndBackend0.simulateHover([selectHID(selectAnimal($client0, '$A'))]);
    dndBackend0.simulateDrop();
    dndBackend0.simulateEndDrag();

    expect($client0.find('DragSource(AnimalSelectLink)'), 'AnimalSelectLink').length(1);

    dndBackend0.simulateBeginDrag([selectHID($client0.find('DragSource(AnimalSelectLink)'))]);
    dndBackend0.simulateHover([selectHID(selectAnimal($client0, '$B'))]);
    dndBackend0.simulateDrop();
    dndBackend0.simulateEndDrag();

    expect(selectCard($client0, 0)).length(0);
    expect(selectAnimal($client0, '$A').find('AnimalLinkedTrait')).length(1);
    expect(selectAnimal($client0, '$B').find('AnimalLinkedTrait')).length(1);

    $client0.unmount();
    $client1.unmount();
  });
});