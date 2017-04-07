import logger from '../utils/logger';
import {selectPlayers4Sockets, selectCard, selectAnimal} from '../selectors';
import {gameDeployAnimalRequest, traitActivateRequest} from './actions';

export const makeGameActionHelpers = (getState, gameId) => ({
  activateTrait: (sourceUser, sourceAnimalIndex, traitName, targetUser, targetAnimalIndex) =>
    traitActivateRequest(
      selectAnimal(getState, gameId, sourceUser, sourceAnimalIndex).id
      , traitName
      , selectAnimal(getState, gameId, targetUser, targetAnimalIndex).id
    )
  , deployAnimal: (sourceUser, cardIndex, animalPosition) =>
    gameDeployAnimalRequest(selectCard(getState, gameId, sourceUser, cardIndex).id, animalPosition)
});

export const actionError = (userId, error) => ({
  type: 'actionError'
  , data: {error}
  , meta: {userId}
});

export const testAction = (data) => ({
  type: 'testAction'
  , data
});

export const server$game = (gameId, action) => (dispatch, getState) =>
  dispatch(Object.assign(action, {
    meta: {users: selectPlayers4Sockets(getState, gameId)}
  }));

export const genericClientToServer = {
};

export const genericServerToClient = {
  actionError: (data) => {
    logger.error('ERROR: ', data);
    return actionError(null, data.error);
  }
};