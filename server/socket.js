import logger from '~/shared/utils/logger';
import io from 'socket.io';
import jwt from 'jsonwebtoken';
import {socketConnect, server$socketDisconnect, clientToServer, actionError} from '../shared/actions/actions'

export const socketServer = (server, options) => io(server, {});

const UNPROTECTED = ['loginUserFormRequest', 'loginUserTokenRequest'];

export const socketStore = (serverSocket, store) => {
  serverSocket.on('connect', (socket) => {
    logger.silly('server:connect');
    store.dispatch(socketConnect(socket.id, (action) => socket.emit('action', action), socket.ip));
    socket.emit('action', socketConnect(socket.id));

    socket.on('disconnect', (reason) => {
      logger.silly('Server DISCONNECT:', reason);
      store.dispatch(server$socketDisconnect(socket.id, reason));
    });

    socket.on('action', (action) => {
      logger.silly('Server Recv:', action.type, action.data);
      if (clientToServer[action.type]) {
        const meta = {connectionId: socket.id}
        if (!~UNPROTECTED.indexOf(action.type)) {
          try {
            const decodedUser = jwt.decode(action.meta.token, process.env.JWT_SECRET);
            if (!decodedUser.id) throw new Error(action.meta.token);
            meta.userId = decodedUser.id;
          } catch (err) {
            logger.warn('token is not valid', err);
            // TODO unlogin user
            return;
          }
        }
        const result = store.dispatch(clientToServer[action.type](action.data, meta));
        if (result instanceof Error) {
          socket.emit('action', actionError({
            name: result.name
            , message: result.message
            , data: result.data
          }))
        }
      } else {
        logger.warn('clientToServer action doesnt exist: ' + action.type);
      }
    });

    socket.on('error', (error) => {
      logger.error('Server:Error', error);
    });
  });
};

export const socketMiddleware = io => store => next => action => {
  const state = store.getState();
  const stateConnections = state.get('connections');
  const nextResult = (action.meta && action.meta.clientOnly
    ? null
    : next(action));
  logger.silly(`Server Send:`, action.type);
  if (action.meta) {
    let sockets = [];
    if (Array.isArray(action.meta.users)) {
      sockets = action.meta.users
        .map(userId => state.getIn(['users', userId, 'connectionId']))
    } else if (action.meta.users === true) {
      sockets = state.get('users').map(user => user.connectionId).toArray();
    } else if (action.meta.socketId) {
      sockets = [action.meta.socketId];
      //} else if (action.meta.clients === true) {
      //  sockets = stateConnections.toArray();
    } else if (action.meta.userId) {
      sockets = [store.getState().getIn(['users', action.meta.userId, 'connectionId'])];
    } else {
      logger.error('Meta not valid:', action.type, action.meta, '|');
    }
    //console.log('Server:Send', action.type, action.meta, sockets);
    sockets
      .filter(connectionId => stateConnections.has(connectionId))
      .map(connectionId => stateConnections.getIn([connectionId, 'sendToClient']))
      .forEach((sendToClient) => sendToClient(Object.assign({}, {
        type: action.type
        , data: action.data
      })));
  }
  return nextResult;
};