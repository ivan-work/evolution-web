//import React from 'react';
//import {Map} from 'immutable';
//
//
//import { Provider } from 'react-redux'
//import { Router, browserHistory } from 'react-router'
//
//import routes from '~/client/routes/index.jsx';
//
//
//import {syncHistoryWithStore} from '~/client/configuration/routing'
//import {loginUserRequest} from '~/shared/actions/actions';
//import {push} from 'react-router-redux';
//
//describe('e2e (login): ', () => {
//  it('Should redirect to login', () => {
//    const clientStore0 = mockClientStore();
//
//    const $root = mount(<Provider store={clientStore0}>
//      <div>
//        <Router history={syncHistoryWithStore(clientStore0, browserHistory)}>
//          {routes(clientStore0.getState)}
//        </Router>
//      </div>
//    </Provider>);
//
//    //expect($root.find('App').props().location.pathname).equal('/login');
//    //expect($root.find('Rooms').length).equal(0);
//    //expect($root.find('Login').length).equal(1);
//  });
//
//  it('Should not redirect to login', () => {
//    const serverStore = mockServerStore();
//    const clientStore0 = mockClientStore().connect(serverStore);
//    clientStore0.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
//
//    const $root = mount(<Provider store={clientStore0}>
//      <div>
//        <Router history={syncHistoryWithStore(clientStore0, browserHistory)}>
//          {routes(clientStore0.getState)}
//        </Router>
//      </div>
//    </Provider>);
//
//    //expect($root.find('App').props().location.pathname).equal('/');
//    //expect($root.find('Rooms').length).equal(1);
//    //expect($root.find('Login').length).equal(0);
//  });
//});