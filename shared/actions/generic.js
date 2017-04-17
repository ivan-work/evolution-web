import logger from '../utils/logger';
import {selectUsersInRoom, selectUsersInGame} from '../selectors';
import {gameDeployAnimalRequest, traitActivateRequest} from './actions';

export const actionError = (error) => ({
  type: 'actionError'
  , data: {error}
});

export const testAction = (data) => ({
  type: 'testAction'
  , data
});

export const testHackGame = (gameId, callback) => ({
  type: 'testHackGame'
  , data: {gameId, callback}
});

export const to$ = (meta, action) => {
  if (typeof action === 'function') throw new Error(`Cannot to$(function)`);
  return Object.assign(action, {meta});
};

export const toUser$Client = (userId, action) => to$({clientOnly: true, userId}, action);

export const server$game = (gameId, action) => (dispatch, getState) =>
  dispatch(to$({users: selectUsersInGame(getState, gameId)}, action));

export const server$toRoom = (roomId, action) => (dispatch, getState) =>
  dispatch(to$({users: selectUsersInRoom(getState, roomId)}, action));

export const server$toUsers = (roomId, action) => to$({users: true}, action);

export const genericClientToServer = {};

export const genericServerToClient = {
  actionError: ({error}) => actionError(error)
};