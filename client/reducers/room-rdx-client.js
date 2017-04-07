import {createReducer} from '~/shared/utils';

export const reducer = createReducer(null, {
  roomsInit: (state, {roomId}) => roomId
  , roomJoinSelf: (state, {roomId}) => roomId
  , roomSpectateSelf: (state, {roomId}) => roomId
  , roomExitSelf: (state) => null
  , socketDisconnect: (state) => null
});