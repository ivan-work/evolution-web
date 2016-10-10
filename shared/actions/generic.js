import {selectPlayers} from '../selectors';

export const actionError = (userId, error) => ({
  type: 'actionError'
  , data: {error}
  , meta: {userId}
});

const actionsChain = (gameId, actionsList) => ({
  type: 'actionsChain'
  , data: {gameId, actionsList}
});


const client$actionsChain = (gameId, actionsList) => (dispatch, getState) => {
  //actionsList.reduce((result, action) => {
  //  return result.then(dispatch(action))
  //}, Promise.resolve());
  //console.log('client$actionsChain', actionsList)
  actionsList.forEach((action) => {
    dispatch(action);
  });
};

export const server$actionsChain = (gameId, actionsList) => (dispatch, getState) => {
  actionsList.forEach((action) => {
    dispatch(action);
  });
  dispatch(Object.assign(actionsChain(gameId, actionsList), {
    meta: {clientOnly: true, users: selectPlayers(getState, gameId)}
  }));
};

export const server$game = (gameId, action) => (dispatch, getState) =>
  dispatch(Object.assign(action, {
    meta: {users: selectPlayers(getState, gameId)}
  }));

export const genericClientToServer = {};

export const genericServerToClient = {
  actionError: (data) => {
    console.error('ERROR: ', data);
    return actionError(null, data.error);
  }
  , actionsChain: ({gameId, actionsList}) => client$actionsChain(gameId, actionsList)
};