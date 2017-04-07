import {createReducer} from '~/shared/utils';
import {List, Map, fromJS} from 'immutable';
import {UserModel} from '~/shared/models/UserModel';

export const reducer = createReducer(List(), {
  loginState: (state, data) => data.online
  , onlineJoin: (state, data) => state.push(data.user)
  , logoutUser: (state, data) => state.remove(state.findIndex(u => u.id == data))
});