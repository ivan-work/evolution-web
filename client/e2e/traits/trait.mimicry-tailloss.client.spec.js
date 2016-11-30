import React from 'react'
import {redirectTo} from '~/shared/utils'
import {mountClient} from '~/shared/test/test-helpers.jsx'

import {selectTrait, selectDTAnimal, selectHID} from '../test.selectors';

/*
 phase: 2
 food: 5
 players:
 - continent: $A carn mimicry tailloss piracy fat, $B
 - continent: $X carn mimicry tailloss piracy fat, $Y
 */

describe.only('Mimicry And Tailloss', () => {
  it('Singleplayer', async () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn, $B mimicry tailloss, $C, $D mimicry, $E tailloss
`);
    clientStore0.dispatch(redirectTo('game'));

    const $client0 = mountClient(clientStore0);

    const dndBackend0 = $client0.find('DragDropContext(GameWrapper)').get(0).getManager().getBackend();

    expect($client0.find('DragSource(AnimalTrait)')).length(1);
    expect($client0.find('DragSource(AnimalTrait)').at(0).find('AnimalTrait').prop('canDrag')).true;

    dndBackend0.simulateBeginDrag([selectHID(selectTrait($client0, '$A', 0))]);
    expect(selectTrait($client0, '$A', 0).find('AnimalTrait').prop('isDragging')).true;
    dndBackend0.simulateHover([selectHID(selectDTAnimal($client0, '$B'))]);
    dndBackend0.simulateDrop();
    dndBackend0.simulateEndDrag();

    const $TraitDefenceDialog = $client0.find('TraitDefenceDialog');
    expect($TraitDefenceDialog, 'TraitDefenceDialog exists').length(1);

    expect($TraitDefenceDialog.find('Animal')).length(2);
    //expect($TraitDefenceDialog.find('Animal')).length(2);

    console.log($TraitDefenceDialog.debug());

    //expect(selectAnimal($client0, '$A').prop('model').getFood()).equal(2);
    ////expect(selectAnimal($client1, '$A').prop('model').getFood()).equal(2);
    //expect(selectAnimal($client0, '$B')).length(0);
    $client0.unmount();
  });
});