import {Map} from 'immutable';
import {createReducer} from '~/shared/utils';

export const reducer = createReducer(Map(), {
  socketConnect: (state, {connectionId, sendToClient}) => state.set(connectionId, sendToClient)
  , socketDisconnect: (state, data) => state.delete(data.connectionId)
});