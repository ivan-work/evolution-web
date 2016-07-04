import io from 'socket.io-client';
import {serverToClient} from '../shared/actions/actions'

export const makeSocketClient = (url, options) => io(url, options);

export const socketMiddleware = socket => store => next => action => {
  const nextResult = next(action);
  if (action.meta && action.meta.server) {
    //const clientId = store.getState().get('clientId');
    //socket.emit('action', objectAssign({}, action, {clientId}));
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
    //console.log(`client(${socket.id}):action`, action.type, action.data);
    if (serverToClient[action.type]) {
      store.dispatch(serverToClient[action.type](action.data));
    } else {
      console.warn('serverToClient action doesnt exist: ' + action.type);
    }
  });
};
