import io from 'socket.io';
import {ObjectID} from 'mongodb';
import {socketConnect, socketDisconnect, clientToServer} from '../shared/actions/actions'

let connectionIds = 0;

export const socketServer = (server) => io(server);

export const socketStore = (serverSocket, store) => {
  serverSocket.on('connect', (socket) => {
    store.dispatch(socketConnect(socket.id, socket));

    socket.emit('connectionId', socket.id);

    socket.on('disconnect', () => {
      store.dispatch(socketDisconnect(socket.id));
    });

    socket.on('action', (action) => {
      if (clientToServer[action.type]) {
        store.dispatch(clientToServer[action.type](socket.id, action.data));
      } else {
        console.warn('Client action doesnt exist: ' + action.type);
      }
    });
  });
};

export const socketMiddleware = io => store => next => action => {
  const state = store.getState().get('connections');
  if (action.meta) {
    if (action.meta.connectionId && state.has(action.meta.connectionId)) {
      const clientSocket = state.get(action.meta.connectionId);
      clientSocket.emit('action', action);
    }
    if (action.meta.clients) {
      io.sockets.emit('action', action);
    }
  }
  return next(action);
};