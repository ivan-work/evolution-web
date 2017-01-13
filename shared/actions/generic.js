import logger from '../utils/logger';
import {selectPlayers4Sockets, selectCard, selectAnimal} from '../selectors';
import {gameDeployAnimalRequest, traitActivateRequest} from './actions';

export const actionError = (error) => ({
  type: 'actionError'
  , data: {error}
});

export const testAction = (data) => ({
  type: 'testAction'
  , data
});

export const server$game = (gameId, action) => (dispatch, getState) =>
  dispatch(Object.assign(action, {meta: {users: selectPlayers4Sockets(getState, gameId)}}));

export const to$ = (meta, action) => Object.assign(action, {meta});

export const toUser$Client = (userId, action) => to$({clientOnly: true, userId}, action);

export const genericClientToServer = {};

export const genericServerToClient = {
  actionError: ({error}) => actionError(error)
};