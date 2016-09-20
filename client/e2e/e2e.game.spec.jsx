//import {Map} from 'immutable';
//import {push} from 'react-router-redux';
////import React from 'react';
//import {mountClient} from '~/shared/test/test-helpers.jsx'
//import {GameModel, GameModelClient, TEST_DECK_SIZE, TEST_HAND_SIZE} from '../../shared/models/game/GameModel';
////var TestLocation = require('react-router');
//
//describe('e2e (game): ', () => {
//  it('Should play a game', () => {
//    const [serverStore, {clientStore0, User0}, {clientStore1, User1}]= mockStores(2);
//    const $client0 = mountClient(clientStore0);
//    const $client1 = mountClient(clientStore1);
//
//    $client0.find('#Rooms$create').simulate('click');
//    const roomId = serverStore.getState().get('rooms').first().id;
//    $client1.find(`RoomsList`).find({'data-id': roomId}).simulate('click');
//    $client0.find('#Room$start').simulate('click');
//
//    expect($client0.find('Game').length).equal(1);
//    expect($client1.find('Game').length).equal(1);
//
//    const $Game0 = $client0.find('DragDropContext(Game)');
//    const $Game1 = $client1.find('DragDropContext(Game)');
//    const dndBackend0 = $Game0.get(0).getManager().getBackend();
//
//    const userWrapper0 = $Game0.find('.PlayerWrapper.UserWrapper');
//    const enemyWrapper0 = $Game0.find('.PlayerWrapper.EnemyWrapper');
//
//    const userWrapper1 = $Game1.find('.PlayerWrapper.UserWrapper');
//    const enemyWrapper1 = $Game1.find('.PlayerWrapper.EnemyWrapper');
//
//    const getDropZoneHID = (i) => userWrapper0.find('DropTarget(PlayerContinentDropTargetZone)').get(i).getHandlerId();
//    /*
//     * Test UI
//     * */
//
//    expect($Game0.find('.CardCollection.Deck')).length(1);
//    expect($Game0.find('.CardCollection.Deck').find('.Card'), 'Deck.length > 0').length(TEST_DECK_SIZE - TEST_HAND_SIZE - TEST_HAND_SIZE);
//    expect(userWrapper0.find('.CardCollection.Hand')).length(1);
//    expect(userWrapper0.find('.CardCollection.Hand').find('.Card'), 'Hand.length == 6').length(TEST_HAND_SIZE);
//    expect(userWrapper0.find('DropTarget(PlayerContinentDropTargetZone)')).length(1);
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
//    expect(userWrapper0.find('PlayerContinentDropTargetZone').props().isOver).false;
//
//    dndBackend0.simulateHover([getDropZoneHID(0)]);
//
//    expect(userWrapper0.find('PlayerContinentDropTargetZone').props().isOver).true;
//    expect(userWrapper0.find('PlayerContinentDropTargetZone')).length(1);
//    expect(userWrapper0.find('.animal-wrapper'), '.animal-wrapper length').length(1);
//    expect(userWrapper0.find('Animal')).length(0);
//    expect(enemyWrapper1.find('.animal-wrapper')).length(0);
//    expect(enemyWrapper1.find('Animal')).length(0);
//
//    dndBackend0.simulateDrop();
//
//    expect(userWrapper0.find('PlayerContinentDropTargetZone')).length(2);
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
//  });
//});