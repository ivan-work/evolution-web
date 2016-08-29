//import React from 'react';
//import {Map} from 'immutable';
//import {Root} from '../components/app/Root.jsx';
//import { hashHistory } from 'react-router';
//import {createMemoryHistory} from 'react-router';
//import { syncHistoryWithStore } from 'react-router-redux'
//import {push} from 'react-router-redux';
//import {roomCreateRequest, roomJoinRequest} from '~/shared/actions/actions';
//
//describe('e2e (game): ', () => {
//  it('Should join game and launch', () => {
//    const [serverStore, {clientStore0, User0}, {clientStore1, User1}]= mockStores(2);
//    clientStore0.dispatch(roomCreateRequest());
//    const roomId = serverStore.getState().get('rooms').first().id;
//    clientStore0.dispatch(roomJoinRequest(roomId));
//
//    //clientStore0.dispatch(push('/test'));
//
//    const client0 = mount(<Root store={clientStore0} history={syncHistoryWithStore(hashHistory, clientStore0, {
//      selectLocationState: (state) => state.get('routing').toJS()
//    })}/>);
//
//
//    const client1 = mount(<Root store={clientStore1} history={createMemoryHistory('/')}/>);
//
//    //console.log(clientStore0.getActions())
//    console.log('Client0URL:', clientStore0.getState().getIn(['routing', 'locationBeforeTransitions', 'pathname']))
//    //console.log('Client0URL:', client0);
//    //console.log(client0.debug())
//
//    clientStore1.dispatch(roomJoinRequest(roomId));
//
//    //expect($root.find('Rooms').length).equal(0);
//    //expect($root.find('Login').length).equal(1);
//  });
//});