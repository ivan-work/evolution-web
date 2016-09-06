import io from 'socket.io-client';
import {serverToClient, loginUserRequest, clientDisconnectSelf} from '../../shared/actions/actions'

export const makeSocketClient = (url, options) => io(url, options);

export const socketMiddleware = socket => store => next => action => {
  const nextResult = next(action);
  if (action.meta && action.meta.server) {
    //const clientId = store.getState().get('clientId');
    //socket.emit('action', objectAssign({}, action, {clientId}));
    action.meta.user = store.getState().get('user');
    //console.log('Client:Send', action.type);
    socket.emit('action', action);
  }
  return nextResult;
};

export const socketStore = (socket, store) => {
  socket.on('connect', () => {
    //console.log('Client store:',store.getState());
    const user = store.getState().get('user');
    if (user != null) {
      const previousLocation = store.getState().getIn(['routing', 'locationBeforeTransitions', 'pathname'], '/');
      store.dispatch(loginUserRequest(previousLocation));
    }
  });
  //socket.on('connect_error', function(error) {
  //  console.log('client:connect_error', error);
  //});
  socket.on('disconnect', (reason) => {
    //console.log('client:disconnect');
    store.dispatch(clientDisconnectSelf(reason));
  });
  socket.on('action', (action) => {
    //console.log('Client:Receive', action.type);
    if (serverToClient[action.type]) {
      const user = store.getState().get('user');
      //console.log('user', user);
      store.dispatch(serverToClient[action.type](action.data, user));
    } else {
      console.error('serverToClient action doesnt exist: ' + action.type);
    }
  });
};
