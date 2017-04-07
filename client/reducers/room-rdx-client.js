import {createReducer} from '~/shared/utils';

export const reducer = createReducer(null, {
  loginUserSuccess: (state, {roomId}) => roomId
  , roomJoin: (state, {roomId}) => roomId
  , roomExit: (state) => null
  , clientDisconnectSelf: (state) => null
});