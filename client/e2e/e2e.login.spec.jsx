//import React from 'react';
//import mochaJsdom from 'mocha-jsdom';
//import {Map} from 'immutable';
//import {Root} from '~/client/components/app/Root.jsx';
//import {syncHistoryWithStore} from '~/client/routing'
//import {loginUserRequest} from '~/shared/actions/actions';
//
//describe('e2e (login): ', () => {
//  //mochaJsdom();
//
//  it('Should redirect to login', () => {
//    const clientStore0 = mockClientStore();
//
//    const $root = mount(<Root store={clientStore0} history={syncHistoryWithStore(clientStore0)}/>);
//
//    expect($root.find('App').props().location.pathname).equal('/login');
//    expect($root.find('Rooms').length).equal(0);
//    expect($root.find('Login').length).equal(1);
//  });
//
//  it('Should not redirect to login', () => {
//    const serverStore = mockServerStore();
//    const clientStore0 = mockClientStore().connect(serverStore);
//    clientStore0.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
//
//    const $root = mount(<Root store={clientStore0} history={syncHistoryWithStore(clientStore0)}/>);
//    expect($root.find('App').props().location.pathname).not.equal('/login');
//    expect($root.find('Rooms').length).equal(1);
//    expect($root.find('Login').length).equal(0);
//  });
//});