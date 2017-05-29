import {
  gameEndTurnRequest
} from '../../actions/actions';

import {selectGame, selectUsersInGame} from '../../selectors';

import {GameModel} from './GameModel';

describe('GameModel:', () => {
  it('Sorts players by index', () => {
    const [{serverStore, ParseGame}] = mockGame(4);
    const gameId = ParseGame(``);
    const getPlayerInfo = (players) => players.map(player => player.index + ':' + player.id);

    const game = selectGame(serverStore.getState, gameId);

    for (let i = 0; i < 4; ++i) {
      expect(game.players.toList().get(i).index).equal(i);
    }
    const sortedPlayers = game.sortPlayersFromIndex(game.players, 2);
    expect(sortedPlayers.get(0).index).equal(2);
    expect(sortedPlayers.get(1).index).equal(3);
    expect(sortedPlayers.get(2).index).equal(0);
    expect(sortedPlayers.get(3).index).equal(1);
  });
});






















