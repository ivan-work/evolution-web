import {
  gameEndTurnRequest
} from '../../actions/actions';

import {GameModel} from './GameModel';

describe('GameModel:', () => {
  it('Sorts players by index', () => {
    const [{serverStore, ServerGame, ParseGame}] = mockGame(8);
    const gameId = ParseGame(``);
    const getPlayerInfo = (players) => players.map(player => player.index + ':' + player.id);

    for (let i = 0; i < 8; ++i) {
      expect(ServerGame().players.toList().get(i).index).equal(i);
    }
    const sortedPlayers = GameModel.sortPlayersFromIndex(ServerGame(), 4);
    expect(sortedPlayers.get(0).index).equal(4);
    expect(sortedPlayers.get(1).index).equal(5);
    expect(sortedPlayers.get(2).index).equal(6);
    expect(sortedPlayers.get(3).index).equal(7);
    expect(sortedPlayers.get(4).index).equal(0);
    expect(sortedPlayers.get(5).index).equal(1);
    expect(sortedPlayers.get(6).index).equal(2);
    expect(sortedPlayers.get(7).index).equal(3);
  });
});






















