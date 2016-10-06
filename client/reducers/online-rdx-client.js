import {createReducer} from '~/shared/utils';
import {List, Map, fromJS} from 'immutable';
import {UserModel} from '~/shared/models/UserModel';

const INITIAL_STATE = Map();

export const reducer = createReducer(INITIAL_STATE, {
  loginUserSuccess: (state, {online}) => online
  , onlineUpdate: (state, {user}) => state.set(user.id, user)
  , logoutUser: (state, {userId}) => state.remove(userId)
  , clientDisconnectSelf: (state, data) => INITIAL_STATE
});