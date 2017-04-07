import socketio from 'socket.io'
import {ObjectID} from 'mongodb';
import {clientActions} from '../actions/index'

const clientIds = 0;

export const socketServer = (server) => socketio(server);

export const socketStore = (socket, store) => {
  socket.on('connect', (socket) => {
    sto

    connections.set(client, socket);

    //socket.on('disconnect', ())

    socket.emit('client', client);

    socket.on('action', (action) => {
      if (clientActions[action.type]) {
        store.dispatch(clientActions[action.type](client, action.data));
      } else {
        console.warn('Client action doesnt exist: ' + action.type);
      }
    });
  });
};

export const socketMiddleware = socket => store => next => action => {
  if (action.meta && action.meta.client && connections.has(action.meta.client)) {
    const clientSocket = connections.get(action.meta.client);
    clientSocket.emit('action', action);
  }
  return next(action);
};