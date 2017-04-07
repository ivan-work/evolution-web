export const selectRoom = (getState, roomId) => getState().getIn(['rooms', roomId]);

// Game:

export const selectGame = (getState, gameId) =>
  getState().getIn(['games', gameId]);

export const selectPlayers4Sockets = (getState, gameId) => {
  const roomId = selectGame(getState, gameId).roomId;
  return [].concat(
    selectRoom(getState, roomId).users.valueSeq().toArray()
    , selectRoom(getState, roomId).spectators.valueSeq().toArray()
  );
};

export const makeGameSelectors = (getState, gameId) => ({
  selectGame: () => selectGame(getState, gameId)
  , selectPlayer: (user) => selectGame(getState, gameId).getPlayer(user)
  , selectCard: (user, cardIndex) => selectGame(getState, gameId).getPlayer(user).getCard(cardIndex)
  , selectAnimal: (user, animalIndex) => selectGame(getState, gameId).getPlayer(user).getAnimal(animalIndex)
  , selectTrait: (user, animalIndex, traitIndex) => selectGame(getState, gameId).getPlayer(user).getAnimal(animalIndex).getIn(['traits', traitIndex])
  , selectTraitId: (user, animalIndex, traitIndex) => selectGame(getState, gameId).getPlayer(user).getAnimal(animalIndex).getIn(['traits', traitIndex]).id
});

export const makeClientGameSelectors = (getState, gameId, i) => ({
  ['selectGame'+i]: () => getState().get('game')
  , ['selectPlayer'+i]: () => getState().get('game').getPlayer()
  , ['selectCard'+i]: (cardIndex, user) => getState().get('game').getPlayer(user).getCard(cardIndex)
  , ['selectAnimal'+i]: (animalIndex, user) => getState().get('game').getPlayer(user).getAnimal(animalIndex)
  , ['selectTrait'+i]: (animalIndex, traitIndex, user) => getState().get('game').getPlayer(user).getAnimal(animalIndex).getIn(['traits', traitIndex])
});