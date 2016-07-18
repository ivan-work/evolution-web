import React from 'react';
import {List, Map} from 'immutable';
import {Room, RoomView} from './Room.jsx';

import {UserModel} from '~/shared/models/UserModel';
import {RoomModel} from '~/shared/models/RoomModel';
//import {loginUserRequest} from '~/shared/actions/actions';

describe('Room', () => {
  describe('Single User', () => {
    it('Displays name', () => {
      const User0 = UserModel.new('TestUser0');
      const Room0 = RoomModel.new(User0.id);
      const clientStore = mockClientStore(Map({
        user: User0
        , room: Room0.id
        , rooms: Map({[Room0.id]: Room0})
      }));
      const $Room = shallow(<RoomView store={clientStore}/>).shallow();
      //expect($room.text().includes(RoomModel.name));
      //
      //expect($wrapper.text().includes('Hello User0')).true
    });
  });
});