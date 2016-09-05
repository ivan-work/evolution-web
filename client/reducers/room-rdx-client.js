import {createReducer} from '~/shared/utils';

export const reducer = createReducer(null, {
  loginState: (state, {roomId}) => roomId
  , roomJoinSuccess: (state, {roomId}) => roomId
  , roomExitSuccess: (state, data) => null
  , clientSelfDisconnect: (state, data) => null
});