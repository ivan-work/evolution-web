import io from 'socket.io-client';
import {serverToClient} from '../shared/actions/actions'

export const makeSocketClient = (url, options) => io(url, options);

export const socketMiddleware = socket => store => next => action => {
  const nextResult = next(action);
  if (action.meta && action.meta.server) {
    //const clientId = store.getState().get('clientId');
    //socket.emit('action', objectAssign({}, action, {clientId}));
    action.meta.user = store.getState().get('user');
    //console.log('client:send:', action.type);
    socket.emit('action', action);
  }
  return nextResult;
};

export const socketStore = (socket, store) => {
  //socket.on('connect', () => {
  //  console.log('client:connect');
  //});
  //socket.on('connect_error', function(error) {
  //  console.log('client:connect_error', error);
  //});
  //socket.on('disconnect', () => {
  //  console.log('client:disconnect');
  //});
  socket.on('action', (action) => {
    if (serverToClient[action.type]) {
      const user = store.getState().get('user');
      //console.log('user', user);
      store.dispatch(serverToClient[action.type](action.data, user));
    } else {
      console.warn('serverToClient action doesnt exist: ' + action.type);
    }
  });
};
