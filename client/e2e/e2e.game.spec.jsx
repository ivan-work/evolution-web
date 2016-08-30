import React from 'react';
import {Map} from 'immutable';
import {Root} from '../components/app/Root.jsx';
import {push} from 'react-router-redux';
import {syncHistoryWithStore} from '~/client/routing'
import {roomCreateRequest, roomJoinRequest} from '~/shared/actions/actions';

//var TestLocation = require('react-router');

describe('e2e (game): ', () => {


  it('Should join game and launch', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}]= mockStores(2);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;
    //clientStore0.dispatch(push('/test'));

    //clientStore0.dispatch(push('/login'));
    clientStore0.getActions()
      .filter(a => a.payload)
      .map((a) => {
          console.log(a.type, a.payload)
        }
      );

    const $client0 = mount(<Root store={clientStore0} history={syncHistoryWithStore(clientStore0)}/>);
    console.log('$client0', $client0.find('App').props().location.pathname);

    console.log($client0.find('App').debug())
    //console.log('$client0TestLocation', TestLocation);
    //console.log('$client0', $client0.debug());
    //console.log('clientStore0', clientStore0.getState().get('routing').toJS());

    //const $client1 = mount(<Root store={clientStore1} history={syncHistoryWithStore(clientStore1)}/>);
    //
    ////console.log('Client0URL:', client0);
    ////console.log(client0.debug())
    //
    //clientStore1.dispatch(roomJoinRequest(roomId));

    //expect($root.find('Rooms').length).equal(0);
    //expect($root.find('Login').length).equal(1);
  });
});