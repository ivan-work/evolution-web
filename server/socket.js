import io from 'socket.io';
import {ObjectID} from 'mongodb';
import {socketConnect, socketDisconnect, clientToServer} from '../shared/actions/actions'

export const socketServer = (server, options) => io(server, {
});

export const socketStore = (serverSocket, store) => {
  serverSocket.on('connect', (socket) => {
    //console.log('server:connect');
    store.dispatch(socketConnect(socket.id, socket));

    socket.emit('connectionId', socket.id);

    socket.on('disconnect', () => {
      //console.log('server:disconnect');
      store.dispatch(socketDisconnect(socket.id));
    });

    socket.on('action', (action) => {
      //console.log('server:action', action.type);
      if (clientToServer[action.type]) {
        store.dispatch(clientToServer[action.type](socket.id, action.data));
      } else {
        console.warn('clientToServer action doesnt exist: ' + action.type);
      }
    });
  });
};

export const socketMiddleware = io => store => next => action => {
  const state = store.getState().get('connections');
  const nextResult = next(action);
  if (action.meta) {
    if (action.meta.connectionId && state.has(action.meta.connectionId)) {
      const clientSocket = state.get(action.meta.connectionId);
      clientSocket.emit('action', action);
    }
    if (action.meta.clients) {
      io.emit('action', action);
    }
  }
  return nextResult;
};