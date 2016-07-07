import {createReducer} from '~/shared/utils';
import {List, Map, fromJS} from 'immutable';
import {UserModel} from '~/shared/models/UserModel';

export const reducer = createReducer(List(), {
  onlineSet: (state, data) => data.users.map(u => new UserModel(u))
  , onlineJoin: (state, data) => state.push(new UserModel(data.user))
  , logoutUser: (state, data) => state.remove(state.findIndex(u => u.id == data))
});