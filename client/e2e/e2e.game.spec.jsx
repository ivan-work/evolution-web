//import {Map} from 'immutable';
//import {push} from 'react-router-redux';
////import React from 'react';
//import {mountClient} from '~/shared/test/test-helpers.jsx'
////var TestLocation = require('react-router');
//
//describe('e2e (game): ', () => {
//  it('Should join game and launch', () => {
//    const [serverStore, {clientStore0, User0}, {clientStore1, User1}]= mockStores(2);
//    const $client0 = mountClient(clientStore0);
//    const $client1 = mountClient(clientStore1);
//
//    $client0.find('#Rooms$create').simulate('click');
//    const roomId = serverStore.getState().get('rooms').first().id;
//    $client1.find(`RoomsList`).find({'data-id': roomId}).simulate('click');
//    $client0.find('#Room$start').simulate('click');
//
//    //console.log(clientStore0.getState().get('game').toJS())
//    //console.log($client0.debug())
//
//    //expect($client0.find('#Room$start').props().disabled, '$client0.#Room$start.disabled').false;
//    //expect($client0.find('Room').length, '$client0.Room').equal(1);
//    //expect($client1.find('Room').length, '$client1.Room').equal(1);
//
//    //console.log('$client0', $client0.find('#Room$start').props().disabled);
//    //expect($client0.find('Room').length, '$client0.have start avaliable').equal(1);
//
//
//    //console.log('$client0', $client0.find('App').props().location.pathname);
//
//    //console.log($client0.find('App').debug())
//    //console.log('$client0TestLocation', TestLocation);
//    //console.log('$client0', $client0.debug());
//    //console.log('clientStore0', clientStore0.getState().get('routing').toJS());
//
//    //const $client1 = mount(<Root store={clientStore1} history={syncHistoryWithStore(clientStore1)}/>);
//    //
//    ////console.log('Client0URL:', client0);
//    //
//    //clientStore1.dispatch(roomJoinRequest(roomId));
//  });
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