import {createReducer} from '~/shared/utils';
import {List, Map, fromJS} from 'immutable';
import {UserRecord} from '~/shared/models/User';

export const reducer = createReducer(List(), {
  onlineSet: (state, data) => data.users
  , onlineJoin: (state, data) => state.push(Map(data.user))
  , logoutUser: (state, data) => state.remove(state.findIndex(u => u.id == data))
});