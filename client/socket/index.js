import io from 'socket.io-client';

export const socket = io(location.host);

export function bindSocketToStore(store) {
  //socket.on('state', state =>
  //  //store.dispatch(setState(state))
  //);
}
