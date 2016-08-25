import {createReducer} from '~/shared/utils';

export const reducer = createReducer(null, {
  roomJoinSuccess: (state, data) => data.roomId
  , roomExitSuccess: (state, data) => null
  , clientSelfDisconnect: (state, data) => null
});