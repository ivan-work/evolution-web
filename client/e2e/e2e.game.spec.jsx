import {Map} from 'immutable';
import {push} from 'react-router-redux';
//import React from 'react';
import {mountClient} from '~/shared/test/test-helpers.jsx'
//var TestLocation = require('react-router');

describe('e2e (game): ', () => {
  it('Should play a game', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}]= mockStores(2);
    const $client0 = mountClient(clientStore0);
    const $client1 = mountClient(clientStore1);

    $client0.find('#Rooms$create').simulate('click');
    const roomId = serverStore.getState().get('rooms').first().id;
    $client1.find(`RoomsList`).find({'data-id': roomId}).simulate('click');
    $client0.find('#Room$start').simulate('click');

    expect($client0.find('Game').length).equal(1);
    expect($client1.find('Game').length).equal(1);

    const $Game0 = $client0.find('DragDropContext(Game)');
    const $Game1 = $client0.find('DragDropContext(Game)').get(0);

    const dndBackend0 = $Game0.get(0).getManager().getBackend();

    //console.log(dndBackend0)
    const $Card = $Game0.find('.Hand').find('DragSource(Card)');
    const cardHID = $Card.get(1).getHandlerId();
    const getDropZoneHID = (i) => $Game0.find('DropTarget(PlayerContinentDropTargetZone)').get(i).getHandlerId();

    expect($Game0.find('DropTarget(PlayerContinentDropTargetZone)').length).equal(1);

    dndBackend0.simulateBeginDrag([cardHID]);

    dndBackend0.simulateHover([getDropZoneHID(0)]);

    dndBackend0.simulateDrop();

    console.log($Game0.find('.PlayerWrapper').find('.PlayerContinent').debug())

    dndBackend0.simulateEndDrag();
  });
  it('Should reload game', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}]= mockStores(2);
    const $client0 = mountClient(clientStore0);
    const $client1 = mountClient(clientStore1);
    $client0.find('#Rooms$create').simulate('click');
    const roomId = serverStore.getState().get('rooms').first().id;
    $client1.find(`RoomsList`).find({'data-id': roomId}).simulate('click');
    $client0.find('#Room$start').simulate('click');

    clientStore0.getClient().disconnect();

    clientStore0.connect(serverStore);

    expect($client0.find('App').props().location.pathname).equal('/game');
  });
});