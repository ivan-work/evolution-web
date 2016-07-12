import io from 'socket.io';
import {ObjectID} from 'mongodb';
import {socketConnect, socketDisconnect, clientToServer} from '../shared/actions/actions'

export const socketServer = (server, options) => io(server, {});

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
      //console.log('server:action', action.type, action.meta);
      if (!clientToServer.$unprotected) {

      }
      if (clientToServer[action.type]) {
        //console.log('action.meta', action.meta)
        store.dispatch(clientToServer[action.type](action.data, {
          connectionId: socket.id
          , ...action.meta
        }));
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
    if (action.meta.clients === true) {
      action.meta.clients = store.getState().get('users')
        .map((user) => user.connectionId);
    }

    if (Array.isArray(action.meta.clients)) {
      action.meta.clients
        .filter(connectionId => state.has(connectionId))
        .map(connectionId => state.get(connectionId))
        .forEach((clientSocket) => clientSocket.emit('action', action));
    }
  }
  return nextResult;
};