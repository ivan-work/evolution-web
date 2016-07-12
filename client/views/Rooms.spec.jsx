import React from 'react';
import {List, Map} from 'immutable';

import {Rooms, RoomsView} from './Rooms.jsx';

import {UserModel} from '~/shared/models/UserModel';

describe('Rooms', () => {
  it('Displays Username', () => {
    const User0 = UserModel.new('TestUser0');
    const clientStore = mockClientStore(Map({
      user: User0
    }));
    const $Rooms0 = shallow(<RoomsView store={clientStore}/>).shallow();

    expect($Rooms0.text()).includes('Hello TestUser0')
  });
});