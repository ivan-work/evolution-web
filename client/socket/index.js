import io from 'socket.io-client';
import objectAssign from 'object-assign';

export const socket = io(location.host, {
  autoConnect: true
});

export const socketMiddleware = socket => store => next => action => {
  if (action.meta && action.meta.server) {
    //const clientId = store.getState().get('clientId');
    //socket.emit('action', objectAssign({}, action, {clientId}));
    socket.emit('action', action);
  }
  return next(action);
};


export const socketStore = (socket, store) => {
  socket.on('connect', (socket) => {
    //console.log('connected');
    //socket.on('login_successful', store.dispatch())
  });
};
