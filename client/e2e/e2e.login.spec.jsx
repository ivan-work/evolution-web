//import React from 'react';
import {Map} from 'immutable';

import {loginUserRequest} from '~/shared/actions/actions';
import {mountClient} from '../../shared/test/test-helpers.jsx'

import {push} from 'react-router-redux';


describe('e2e (login): ', () => {
  it('Should redirect to login', () => {
    const clientStore0 = mockClientStore();
    const $client0 = mountClient(clientStore0);

    expect($client0.find('App').props().location.pathname).equal('/login');
    expect($client0.find('Rooms')).length(0);
    expect($client0.find('Login')).length(1);

    $client0.unmount();
  });

  it('Should not redirect to login', () => {
    const serverStore = mockServerStore();
    const clientStore0 = mockClientStore().connect(serverStore);
    const $client0 = mountClient(clientStore0);

    expect($client0.find('App').props().location.pathname).equal('/login');
    expect($client0.find('Rooms').length).equal(0);
    expect($client0.find('Login').length).equal(1);

    clientStore0.dispatch(loginUserRequest('/', 'User0', 'testPassword'));

    expect($client0.find('App').props().location.pathname).equal('/');
    expect($client0.find('Rooms').length).equal(1);
    expect($client0.find('Login').length).equal(0);

    $client0.unmount();
  });
});