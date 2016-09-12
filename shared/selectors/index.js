export const selectRoom = (getState, roomId) => getState().getIn(['rooms', roomId]);

export const selectGame = (getState, gameId) => getState().getIn(['games', gameId]);