import io from 'socket.io-client';
import {serverToClient} from '../shared/actions/actions'

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
  socket.on('action', (action) => {
    console.log('client: received action', action.type);
    if (serverToClient[action.type]) {
      store.dispatch(serverToClient[action.type](action.data));
    } else {
      console.warn('Server action doesnt exist: ' + action.type);
    }
  });
};
