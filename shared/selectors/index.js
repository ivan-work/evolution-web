export const selectRoom = (getState, roomId) => getState().getIn(['rooms', roomId]);

export const selectUserName = (getState, userId) => getState().getIn(['users', userId, 'login']);
// Game:

/**
 * @param getState
 * @param gameId
 * @return {GameModel} game
 */
export const selectGame = (getState, gameId) =>
  getState().getIn(['games', gameId]);

export const selectPlayer = (game, user) =>
  game.getPlayer(user);

export const selectAnimal = (game, user, animalIndex) =>
  selectPlayer(game, user).continent.toArray()[animalIndex];

export const selectTrait = (game, user, animalIndex, traitIndex) =>
  selectAnimal(game, user, animalIndex).traits.toArray()[traitIndex];

export const findTrait = (game, animalId, traitType, index = 0) => game.locateAnimal(animalId).traits.toIndexedSeq()
  .filter(t => t.type === traitType).get(index);

export const findPlantTrait = (game, plantId, traitType, index = 0) => game.getPlant(plantId).traits.toIndexedSeq()
  .filter(t => t.type === traitType).get(index);

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
  , selectPlayer: (user) => selectPlayer(selectGame(getState, gameId), user)

  , selectCard: (user, cardIndex) => selectGame(getState, gameId).getPlayer(user).getCard(cardIndex)
  , findCard: (user, type) => selectGame(getState, gameId).getPlayer(user).hand.find(c => c.trait1 === type || c.trait2 === type).id

  , selectAnimal: (user, animalIndex) => selectAnimal(selectGame(getState, gameId), user, animalIndex)
  , findAnimal: (animalId) => selectGame(getState, gameId).locateAnimal(animalId)

  , selectTrait: (user, animalIndex, traitIndex) => selectTrait(selectGame(getState, gameId), user, animalIndex, traitIndex)
  , selectTraitId: (user, animalIndex, traitIndex) => selectTrait(selectGame(getState, gameId), user, animalIndex, traitIndex).id

  , findPlant: (plantId) => selectGame(getState, gameId).getPlant(plantId)

  , findTrait: (animalId, traitType, index = 0) => findTrait(selectGame(getState, gameId), animalId, traitType, index)
  , findPlantTrait: (plantId, traitType, index = 0) => findPlantTrait(selectGame(getState, gameId), plantId, traitType, index)
});

export const makeClientGameSelectors = (getState, gameId, i) => ({
  ['selectGame' + i]: () => getState().get('game')
  , ['selectPlayer' + i]: (user) => getState().get('game').getPlayer(user)
  , ['selectCard' + i]: (user, cardIndex) => getState().get('game').getPlayer(user).getCard(cardIndex)

  , ['selectAnimal' + i]: (user, animalIndex) => selectAnimal(getState().get('game'), user, animalIndex)
  , ['findAnimal' + i]: (animalId) => getState().get('game').locateAnimal(animalId)

  , ['findPlant' + i]: (plantId) => getState().get('game').getPlant(plantId)

  , ['findTrait' + i]: (animalId, traitType, index = 0) => findTrait(getState().get('game'), animalId, traitType, index)
  , ['findPlantTrait' + i]: (plantId, traitType, index = 0) => findPlantTrait(getState().get('game'), plantId, traitType, index)

  , ['selectTrait' + i]: (user, animalIndex, traitIndex) => selectTrait(getState().get('game'), user, animalIndex, traitIndex)
});

export const selectClientRoute = (getState) => getState().getIn(['routing', 'locationBeforeTransitions', 'pathname']);