export const selectRoom = (getState, roomId) => getState().getIn(['rooms', roomId]);

export const selectPlayers = (getState, gameId) => getState().getIn(['games', gameId, 'players']).keySeq().toArray();

export const selectGame = (getState, gameId) => getState().getIn(['games', gameId]);