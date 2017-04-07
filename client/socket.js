import io from 'socket.io-client';
import {serverToClient} from '../shared/actions/actions'

export const makeSocketClient = (url, options) => io(url, options);

export const socketMiddleware = socket => store => next => action => {
  if (action.meta && action.meta.server) {
    //const clientId = store.getState().get('clientId');
    //socket.emit('action', objectAssign({}, action, {clientId}));
    socket.emit('action', action);
  }
  return next(action);
};

export const socketStore = (socket, store) => {
  socket.on('connect', () => {
    console.log('client:connect');
  });
  socket.on('connect_error', function(error) {
    console.log('client:connect_error', error);
  });
  socket.on('disconnect', () => {
    console.log('client:disconnect');
  });
  socket.on('action', (action) => {
    console.log('client:action');
    if (serverToClient[action.type]) {
      store.dispatch(serverToClient[action.type](action.data));
    } else {
      console.warn('Server action doesnt exist: ' + action.type);
    }
  });
};
