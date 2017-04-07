import {Map} from 'immutable';
import {createReducer} from '~/shared/utils';

export const reducer = createReducer(Map(), {
  loginUser: (state, {user}) => state.set(user.id, user)
  , logoutUser: (state, {userId}) => state.remove(userId)
});