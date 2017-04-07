import {createReducer} from '~/shared/utils';
import {List, Map, fromJS} from 'immutable';

export const reducer = createReducer(List(), {
  onlineSet: (state, data) => fromJS(data.users)
  , onlineJoin: (state, data) => state.push(Map(data.user))
  , logoutUser: (state, data) => state.remove(state.findIndex(u => u.id == data))
});