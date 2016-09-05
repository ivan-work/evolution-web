import {Map} from 'immutable';
import {push} from 'react-router-redux';
import {roomCreateRequest, roomJoinRequest} from '~/shared/actions/actions';

//import React from 'react';
import {mountClient} from '~/shared/test/test-helpers.jsx'
//var TestLocation = require('react-router');

describe('e2e (rooms): ', () => {
  it('Should be able to create', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
    const $client0 = mountClient(clientStore0);
    const $client1 = mountClient(clientStore1);

    $client0.find('#Rooms$create').simulate('click');

    expect($client0.find('Room').length).equal(1);
  });

  it('Room testing', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}]= mockStores(2);
    const $client0 = mountClient(clientStore0);
    const $client1 = mountClient(clientStore1);

    $client0.find('#Rooms$create').simulate('click');

    expect($client0.find('Room').length, '$client0.Room').equal(1);
    expect($client0.find('#Room$start').props().disabled, '$client0.#Room$start.disabled').true;
    expect($client1.find('Room').length, '$client1.Room').equal(0);

    $client1.find(`RoomsList`).find('a').first().simulate('click');

    expect($client0.find('Room').length, '$client0.Room').equal(1);
    expect($client0.find('#Room$start').props().disabled, '$client0.#Room$start.disabled').false;
    expect($client1.find('Room').length, '$client1.Room').equal(1);
    expect($client1.find('#Room$start').props().disabled, '$client1.#Room$start.disabled').true;
  })
});