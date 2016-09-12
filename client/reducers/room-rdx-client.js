import {createReducer} from '~/shared/utils';

export const reducer = createReducer(null, {
  loginUserSuccess: (state, {roomId}) => roomId
  , roomJoinSuccess: (state, {roomId}) => roomId
  , roomExitSuccess: (state, {roomId}) => null
  , clientDisconnectSelf: (state, data) => null
});