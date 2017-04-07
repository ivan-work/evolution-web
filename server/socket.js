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
      // Clients == true => to all
      io.emit('action', action);
    } else if (action.meta.users === true) {
      // Users == true => to all users
      action.meta.clients = store.getState().get('users')
        .map((user) => user.connectionId)
        .toArray();
      //if (action.type === 'onlineJoin') {
      //  console.log(` `);
      //  console.log(`START Server:${action.type}`);
      //  console.log(`Current state: `, store.getState().get('users').map(u => ([u.login, u.id, u.connectionId])));
      //  console.log(`Sending to: `, action.meta.clients);
      //  console.log(`ENDOF Server:${action.type}`);
      //  console.log(` `);
      //}
    } else if (action.meta.user) {
      action.meta.clients = [action.meta.user.connectionId];
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