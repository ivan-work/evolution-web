import {Map, List, OrderedMap} from 'immutable';

import {PHASE} from '../../models/game/GameModel';
import {TraitModel} from '../../models/game/evolution/TraitModel';
import * as randomGenerator from '../../utils/randomGenerator';
import * as dbActions from '../../../server/actions/db';
import * as traits from '../../models/game/evolution/traitsData/index';

import {server$gameEnd} from '../actions';

import {makeGameSelectors} from '../../selectors';

describe('Saving game to database', function () {
  let sandbox;
  before(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(randomGenerator, 'getRandom').returns(0);
    sandbox.stub(Date, 'now').returns(123);
  });

  after(() => {
    sandbox.restore();
  });

  it('GameModel.toDatabase', () => {
    const [{serverStore, ParseGame}
      , {clientStore0, User0}
      , {clientStore1, User1}
      , {clientStore2, User2}] = mockGame(3);
    const gameId = ParseGame(`
food: 0
phase: feeding
players:
  - continent: $ +
  - continent: $ +
  - continent: $ +
`);
    const {selectGame} = makeGameSelectors(serverStore.getState, gameId);
    serverStore.dispatch({
      type: 'gameEnd'
      , data: {gameId, game: selectGame(gameId)}
    });
    const game = selectGame(gameId);
    // console.log(game.toJS());
    expect(game.toDatabase(serverStore.getState, true)).eql({
      id: game.id
      , roomId: game.roomId
      , timeCreated: 123
      , timeEnd: 123
      , players: [{
        id: User0.id
        , name: 'User0'
        , playing: true
        , index: 0
      }, {
        id: User1.id
        , name: 'User1'
        , playing: true
        , index: 1
      }, {
        id: User2.id
        , name: 'User2'
        , playing: true
        , index: 2
      }]
      , settings: {
        maxPlayers: 4
        , timeTurn: 120e3
        , timeTraitResponse: 60e3
        , timeAmbush: 10e3
        , randomPlayers: false
        , halfDeck: false
        , addon_base2: false
        , addon_timeToFly: false
        , addon_continents: false
        , addon_bonus: false
        , addon_plantarium: false
        , addon_customff: false
        , addon_lifecycle: false
      }
      , status: {
        turn: 0
        , round: 0
      }
      , scoreboardFinal: [
        {playerId: User0.id, playing: true, scoreNormal: 2, scoreDead: 0, scoreRandom: 0}
        , {playerId: User1.id, playing: true, scoreNormal: 2, scoreDead: 0, scoreRandom: 0}
        , {playerId: User2.id, playing: true, scoreNormal: 2, scoreDead: 0, scoreRandom: 0}
      ]
      , winnerId: game.winnerId
      , finished: true
    });
  });

  it('Game writing to database', () => {
    const [{serverStore, ParseGame}
      , {clientStore0, User0}
      , {clientStore1, User1}
      , {clientStore2, User2}] = mockGame(3);
    const gameId = ParseGame(`
food: 0
phase: feeding
players:
  - continent: $ +
  - continent: $ +
  - continent: $ +
`);
    const {selectGame} = makeGameSelectors(serverStore.getState, gameId);

    let dbActionsMock = sandbox.mock(dbActions);
    dbActionsMock.expects("db$gameEnd").once();

    serverStore.dispatch(server$gameEnd(selectGame().id, true));
    dbActionsMock.verify();
  });
});