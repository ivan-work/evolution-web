import {Map} from 'immutable';
import {push} from 'react-router-redux';
import {roomCreateRequest, roomJoinRequest} from '../../shared/actions/actions';

//import React from 'react';
import {mountClient} from '~/shared/test/test-helpers.jsx'
//var TestLocation = require('react-router');

describe('e2e (rooms): ', () => {
  it('Should be able to create', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
    const $client0 = mountClient(clientStore0);
    const $client1 = mountClient(clientStore1);

    expect($client0.find('#Rooms$Create')).length(1);
    $client0.find('#Rooms$Create').simulate('click');

    expect($client0.find('Room')).length(1);
    $client0.unmount();
    $client1.unmount();
  });

  it('Room testing', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}]= mockStores(2);
    const $client0 = mountClient(clientStore0);
    const $client1 = mountClient(clientStore1);

    clientStore0.dispatch(roomCreateRequest());

    expect($client0.find('Room'), '$client0.Room').length(1);
    expect($client1.find('Room'), '$client1.Room').length(0);

    $client1.find(`RoomsList`).find('a').first().simulate('click');

    expect($client0.find('Room'), '$client0.Room').length(1);
    expect($client0.find('#Room$Start').props().disabled, '$client0.#Room$Start.disabled').false;
    expect($client1.find('Room'), '$client1.Room').length(1);
    expect($client1.find('#Room$Start').props().disabled, '$client1.#Room$Start.disabled').true;
    
    $client0.unmount();
    $client1.unmount();
  })
});