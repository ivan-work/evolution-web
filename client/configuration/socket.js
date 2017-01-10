import logger from '~/shared/utils/logger';
import io from 'socket.io-client';
import {serverToClient, socketDisconnect, loginUserTokenRequest, loginUserFailure} from '../../shared/actions/actions'
import LocationService from '../services/LocationService';

export const makeSocketClient = (url, options) => io(url, options);

export const socketMiddleware = socket => store => next => action => {
  const nextResult = next(action);
  if (action.meta && action.meta.server) {
    //const clientId = store.getState().get('clientId');
    //socket.emit('action', objectAssign({}, action, {clientId}));
    action.meta.token = store.getState().getIn(['user', 'token']);
    logger.silly('Client Send:', action.type);
    socket.emit('action', action);
  }
  return nextResult;
};

export const socketStore = (socket, store) => {
  socket.on('connect', () => {
    //console.log('Client store:',store.getState());
    // console.log('socket connected', LocationService.getLocationQuery().token)
    const locationToken = LocationService.getLocationQuery().token;
    const userToken = store.getState().getIn(['user', 'token']);
    let previousLocation = store.getState().getIn(['routing', 'locationBeforeTransitions', 'pathname'], '/');
    if (previousLocation === '/login') previousLocation = '/';
    if (locationToken) {
      // console.log('locationToken', previousLocation)
      store.dispatch(loginUserTokenRequest(previousLocation, locationToken));
    } else if (userToken) {
      // console.log('userToken', previousLocation)
      store.dispatch(loginUserTokenRequest(previousLocation, userToken));
    } else {
      // console.log('no token')
      store.dispatch(loginUserFailure());
    }
  });
  //socket.on('connect_error', function(error) {
  //  console.log('client:connect_error', error);
  //});
  socket.on('disconnect', (reason) => {
    //console.log('client:disconnect');
    store.dispatch(socketDisconnect(socket.id, reason));
  });
  socket.on('action', (action) => {
    logger.silly('Client Recv:', action.type);
    if (serverToClient[action.type]) {
      const currentUserId = store.getState().getIn(['user', 'id']);
      //console.log('user', user);
      //action.user = user;
      store.dispatch(serverToClient[action.type](action.data, currentUserId));
    } else {
      logger.error('serverToClient action doesnt exist: ' + action.type);
    }
  });
  socket.on('error', (error) => {
    logger.error('Client:Error', error);
  });
};
