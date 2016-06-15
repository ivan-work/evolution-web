import {Map} from 'immutable';

export function reducer(state = Map(), action) {
  switch (action.type) {
    case 'socketConnect':
      return state.set(action.data.connectionId, action.data.socket);
    case 'socketDisconnect':
      return state.delete(action.data.connectionId);
    default:
      return state;
  }
}

export const reducer2 = {
  socketConnect: (state, action) => state.set(action.data.connectionId, action.data.socket)
  , socketDisconnect: (state, action) => state.delete(action.data.connectionId)
};