import {Map} from 'immutable';
import {createReducer} from '~/shared/utils';

export const reducer = createReducer(Map(), {
  socketConnect: (state, data) => state.set(data.connectionId, data.socket)
  , socketDisconnect: (state, data) => state.delete(data.connectionId)
});