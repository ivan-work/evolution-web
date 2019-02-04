import {Map} from 'immutable';
import React from 'react';
import {mountClient} from '~/shared/test/test-helpers.jsx'
import {GameModel, GameModelClient, TEST_DECK_SIZE, TEST_HAND_SIZE} from '../../shared/models/game/GameModel';
//var TestLocation = require('react-router');

describe('e2e (game): ', () => {
  it('Should play a game', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}]= mockStores(2);
    const $client0 = mountClient(clientStore0);
    const $client1 = mountClient(clientStore1);


    expect($client0.find('#Rooms$Create'), '#Rooms$Create').length(1);
    $client0.find('#Rooms$Create').simulate('click');

    expect(clientStore0.getState().get('room'), 'client0 in room').ok;
    expect(clientStore1.getState().get('room'), 'client1 not in room').null;
    const roomId = serverStore.getState().get('rooms').first().id;

    expect($client1.find(`RoomsList a`), `RoomsList a`).length(1);
    $client1.find(`RoomsList a`).simulate('click');

    expect($client0.find('#Room$Start'), '#Room$Start').length(1);
    $client0.find('#Room$Start').simulate('click');

    expect($client0.find('DragDropContext(GameWrapper)'), 'DragDropContext(GameWrapper)').length(1);
    expect($client1.find('DragDropContext(GameWrapper)'), 'DragDropContext(GameWrapper)').length(1);

    const $Game0 = $client0.find('DragDropContext(GameWrapper)');
    const $Game1 = $client1.find('DragDropContext(GameWrapper)');
    //console.log($Game0.get(0))

    $client0.unmount();
    $client1.unmount();
    //const dndBackend0 = $Game0.get(0).getManager().getBackend();

//    const userWrapper0 = $Game0.find('.PlayerWrapper.UserWrapper');
//    const enemyWrapper0 = $Game0.find('.PlayerWrapper.EnemyWrapper');
//
//    const userWrapper1 = $Game1.find('.PlayerWrapper.UserWrapper');
//    const enemyWrapper1 = $Game1.find('.PlayerWrapper.EnemyWrapper');
//
//    const getDropZoneHID = (i) => userWrapper0.find('DropTarget(ContinentZone)').get(i).getHandlerId();
//    /*
//     * Test UI
//     * */
//
//    expect($Game0.find('.CardCollection.Deck')).length(1);
//    expect($Game0.find('.CardCollection.Deck').find('.Card'), 'Deck.length > 0').length(TEST_DECK_SIZE - TEST_HAND_SIZE - TEST_HAND_SIZE);
//    expect(userWrapper0.find('.CardCollection.Hand')).length(1);
//    expect(userWrapper0.find('.CardCollection.Hand').find('.Card'), 'Hand.length == 6').length(TEST_HAND_SIZE);
//    expect(userWrapper0.find('DropTarget(ContinentZone)')).length(1);
//    expect(userWrapper0.find('.animal-wrapper')).length(0);
//    expect(userWrapper0.find('Animal')).length(0);
//
//
//    expect(enemyWrapper1.find('CardCollection')).length(1);
//    expect(enemyWrapper1.find('CardCollection').find('.Card'), 'Hand.length == 6').length(TEST_HAND_SIZE);
//    expect(enemyWrapper1.find('.animal-wrapper')).length(0);
//    expect(enemyWrapper1.find('Animal')).length(0);
//
//    const $Card = userWrapper0.find('.Hand').find('DragSource(Card)');
//    const cardHID = $Card.get(1).getHandlerId();
//
//    /*
//     * Test DnD
//     * */
//    clientStore0.clearActions()
//
//    dndBackend0.simulateBeginDrag([cardHID]);
//
//    expect(userWrapper0.find('ContinentZone').props().isOver).false;
//
//    dndBackend0.simulateHover([getDropZoneHID(0)]);
//
//    expect(userWrapper0.find('ContinentZone').props().isOver).true;
//    expect(userWrapper0.find('ContinentZone')).length(1);
//    expect(userWrapper0.find('.animal-wrapper'), '.animal-wrapper length').length(1);
//    expect(userWrapper0.find('Animal')).length(0);
//    expect(enemyWrapper1.find('.animal-wrapper')).length(0);
//    expect(enemyWrapper1.find('Animal')).length(0);
//
//    dndBackend0.simulateDrop();
//
//    expect(userWrapper0.find('ContinentZone')).length(2);
//    expect(userWrapper0.find('.animal-wrapper'), '.animal-wrapper length').length(1);
//    expect(userWrapper0.find('Animal'), 'userWrapper0 Animal').length(1);
//    expect(enemyWrapper1.find('.animal-wrapper'), 'enemyWrapper1 .animal-wrapper').length(1);
//    expect(enemyWrapper1.find('UnknownAnimal'), 'enemyWrapper1 Animal').length(1);
//
//    dndBackend0.simulateEndDrag();
//  });
//
//  it('Should reload game', () => {
//    const [serverStore, {clientStore0, User0}, {clientStore1, User1}]= mockStores(2);
//    const $client0 = mountClient(clientStore0);
//    const $client1 = mountClient(clientStore1);
//    $client0.find('#Rooms$create').simulate('click');
//    const roomId = serverStore.getState().get('rooms').first().id;
//    $client1.find(`RoomsList`).find({'data-id': roomId}).simulate('click');
//    $client0.find('#Room$start').simulate('click');
//
//    clientStore0.getClient().disconnect();
//
//    clientStore0.connect(serverStore);
//
//    expect($client0.find('App').props().location.pathname).equal('/game');
  });
});