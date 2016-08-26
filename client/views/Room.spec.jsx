import React from 'react';
import {List, Map} from 'immutable';
import {Room, RoomView} from './Room.jsx';

import {UserModel} from '~/shared/models/UserModel';
import {RoomModel} from '~/shared/models/RoomModel';
import {SOCKET_DISCONNECT_NOW, roomCreateRequest, roomJoinRequest, gameStartRequest} from '../../shared/actions/actions';

describe('Room', () => {
  it('UsersList', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
    const getOnlineLengthForRoom = (store) => shallow(<RoomView store={store}/>).shallow().find('.Room-online').find('UsersList').shallow().find('li').length;

    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;

    expect(getOnlineLengthForRoom(clientStore0), 'User0 created room @clientStore0').eql(1);
    expect(getOnlineLengthForRoom(clientStore1), 'User0 created room @clientStore1').eql(0);

    clientStore1.dispatch(roomJoinRequest(roomId));

    expect(getOnlineLengthForRoom(clientStore0), 'User1 joins @clientStore0').eql(2);
    expect(getOnlineLengthForRoom(clientStore1), 'User1 joins @clientStore1').eql(2);

    //clientStore0.getClient().disconnect(SOCKET_DISCONNECT_NOW);
    //console.log(shallow(<RoomView store={clientStore0}/>).shallow().find('UsersList').at(0).shallow().debug())
    //console.log(clientStore0.getState().toJS())
    //console.log(shallow(<RoomView store={clientStore0}/>).shallow().find('UsersList').at(1).shallow().debug())
    //expect(getOnlineLengthForRoom(clientStore0), 'User0 left @clientStore0').eql(0);
    //console.log('clientStore1', clientStore1.getState().toJS())
    //expect(getOnlineLengthForRoom(clientStore1), 'User0 left @clientStore1').eql(1);
  });

  it('Game Start', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;
    clientStore0.dispatch(roomJoinRequest(roomId));
    clientStore0.clearActions();

    const $Room = shallow(<RoomView store={clientStore0}/>).shallow();
    //clientStore1.dispatch(roomJoinRequest(roomId));
    //clientStore0.dispatch(gameStartRequest(roomId));
    //clientStore0.dispatch(gameReadyRequest());
    //clientStore1.dispatch(gameReadyRequest());

    //console.log('#Room$back', $Room.find('#Room$back').debug())
    //
    //$Room.find('#Room$start').simulate('click');

    //console.log($Room.debug());
    //console.log(clientStore0.getActions());
    //expect($room.text().includes(RoomModel.name));
    //
    //expect($wrapper.text().includes('Hello User0')).true
  });
});