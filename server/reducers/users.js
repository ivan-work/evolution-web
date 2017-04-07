import {Map} from 'immutable';
import {createReducer} from '~/shared/utils';

export const reducer = createReducer(Map(), {
  loginUserSuccess: (state, data) => state.set(data.user.id, data.user)
  , logoutUser: (state, userId) => state.remove(userId)
});