import {createReducer} from '~/shared/utils';

export const reducer = createReducer(null, {
  loginUserSuccess: (state, {roomId}) => roomId
  , roomJoinSuccessSelf: (state, {roomId}) => roomId
  , roomExitSuccessSelf: (state, {roomId}) => null
  , clientDisconnectSelf: (state, data) => null
});