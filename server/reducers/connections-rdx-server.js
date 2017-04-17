import {Map} from 'immutable';
import {createReducer} from '../../shared/utils';

export const reducer = createReducer(Map(), {
  socketConnect: (state, {connectionId, sendToClient, ip}) => state.set(connectionId, Map({sendToClient, ip}))
  , socketDisconnect: (state, {connectionId}) => state.delete(connectionId)
});