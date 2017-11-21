import {Map, List, OrderedMap} from 'immutable';

import {PHASE} from '../../models/game/GameModel';
import {TraitModel} from '../../models/game/evolution/TraitModel';
import {GameModel} from '../../models/game/GameModel';
import * as traits from '../../models/game/evolution/traitsData/index';

import {
  traitTakeFoodRequest
  , traitActivateRequest
  , gameEndTurnRequest
  , roomExitRequest

  , roomCreateRequest
  , gameDeployAnimalRequest
  , roomJoinRequest
  , roomSpectateRequest
  , roomSetSeedRequest
  , roomStartVotingRequest
  , roomStartVoteActionRequest

  , SOCKET_DISCONNECT_NOW
} from '../actions';

import {makeGameSelectors} from '../../selectors';

describe.only('Saving game to database', function () {
  let mathRandom, dateNow;
  before(() => {
    
    // GameModel.__Rewire__('randomGenerator', {
    //   getRandom: (name) => 'test'
    // });
    // mathRandom = sinon.stub(Math, 'random').returns(0);
    // dateNow = sinon.stub(Date, 'now').returns(123);
  });

  after(() => {
    // mathRandom.restore();
    // dateNow.restore();
  });

  it('Game ends', () => {
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
    expect(game.toDatabase(serverStore.getState)).eql({
      id: game.id
      , roomId: game.roomId
      , timestamp: 123
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
        , timeTurn: 120000
        , timeTraitResponse: 60000
        , timeAmbush: 10000
        , randomPlayers: false
        , halfDeck: false
        , addon_timeToFly: false
        , addon_continents: false
        , addon_bonus: false
        , addon_plantarium: false
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
    });

    console.log({
      id: game.id
      , roomId: game.roomId
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
        , timeTurn: 120000
        , timeTraitResponse: 60000
        , timeAmbush: 10000
        , randomPlayers: false
        , halfDeck: false
        , addon_timeToFly: false
        , addon_continents: false
        , addon_bonus: false
        , addon_plantarium: false
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
    })
  });
});