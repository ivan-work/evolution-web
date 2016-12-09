import {createReducer} from '~/shared/utils';

export const reducer = createReducer(null, {
  loginUser: (state, {roomId}) => roomId
  , roomJoin: (state, {roomId}) => roomId
  , roomExit: (state) => null
  , socketDisconnect: (state) => null
});