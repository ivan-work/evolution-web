export const selectRoom = (getState, roomId) => getState().getIn(['rooms', roomId]);

// Game:

/**
 * @param getState
 * @param gameId
 * @return {GameModel} game
 */
export const selectGame = (getState, gameId) =>
  getState().getIn(['games', gameId]);

export const selectTrait = (game, user, animalIndex, traitIndex) =>
  game.getPlayer(user).getAnimal(animalIndex).traits.toArray()[traitIndex];


export const selectUsersInRoom = (getState, roomId) => {
  const room = selectRoom(getState, roomId);
  return [].concat(
    room.users.valueSeq().toArray()
    , room.spectators.valueSeq().toArray()
  );
};

export const selectUsersInGame = (getState, gameId) =>
  selectUsersInRoom(getState, selectGame(getState, gameId).roomId);

export const makeGameSelectors = (getState, gameId) => ({
  selectGame: () => selectGame(getState, gameId)
  , selectPlayer: (user) => selectGame(getState, gameId).getPlayer(user)
  , selectCard: (user, cardIndex) => selectGame(getState, gameId).getPlayer(user).getCard(cardIndex)
  , findCard: (user, type) => selectGame(getState, gameId).getPlayer(user).hand.find(c => c.trait1 === type || c.trait2 === type).id
  , selectAnimal: (user, animalIndex) => selectGame(getState, gameId).getPlayer(user).getAnimal(animalIndex)
  , findAnimal: (animalId) => selectGame(getState, gameId).locateAnimal(animalId).animal
  , selectTrait: (user, animalIndex, traitIndex) => selectTrait(selectGame(getState, gameId), user, animalIndex, traitIndex)
  , selectTraitId: (user, animalIndex, traitIndex) => selectTrait(selectGame(getState, gameId), user, animalIndex, traitIndex).id
  , findTrait: (animalId, traitType) => selectGame(getState, gameId).locateAnimal(animalId).animal.hasTrait(traitType, true)
});

export const makeClientGameSelectors = (getState, gameId, i) => ({
  ['selectGame' + i]: () => getState().get('game')
  , ['selectPlayer' + i]: () => getState().get('game').getPlayer()
  , ['selectCard' + i]: (cardIndex, user) => getState().get('game').getPlayer(user).getCard(cardIndex)
  , ['selectAnimal' + i]: (animalIndex, user) => getState().get('game').getPlayer(user).getAnimal(animalIndex)
  , ['selectTrait' + i]: (animalIndex, traitIndex, user) => selectTrait(getState().get('game'), user, animalIndex, traitIndex)
});

export const selectClientRoute = (getState) => getState().getIn(['routing', 'locationBeforeTransitions', 'pathname']);