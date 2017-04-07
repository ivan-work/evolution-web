import {createReducer} from '~/shared/utils';
import {List, Map, fromJS} from 'immutable';
import {UserModel} from '~/shared/models/UserModel';

export const reducer = createReducer(List(), {
  loginUserSuccess: (state, {online}) => online
  , onlineUpdate: (state, {user}) => {
    const index = state.findIndex(u => u.id === user.id);
    return ~index
      ? state.set(index, user)
      : state.push(user)
  }
  , logoutUser: (state, {userId}) => state.filter(u => u.id !== userId)
  , clientDisconnectSelf: (state, data) => List()
});