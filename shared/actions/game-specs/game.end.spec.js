import {Map, List} from 'immutable';

import {PHASE} from '../../models/game/GameModel';
import {TraitModel} from '../../models/game/evolution/TraitModel';
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

describe('Game (ENDING PHASE):', function () {
  it('Next deploy: (FULL DECK)', () => {
    const [{serverStore, ParseGame}
      , {clientStore0, User0, ClientGame0}
      , {clientStore1, User1, ClientGame1}
      , {clientStore2, User2, ClientGame2}] = mockGame(3);
    const gameId = ParseGame(`
deck: 32 carn
food: 0
phase: 2
players:
  - continent: $Q piracy, $W +
  - continent: $A mass + fat=true fat=true, $D +
  - continent:
`);
    const {selectGame, selectPlayer, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);
    // User0: $A +, $B, $C, $D carn +, $E

    console.log(selectGame().status);
    console.log(selectPlayer(User0).continent);
    clientStore0.dispatch(gameEndTurnRequest()); // Q can't have AutoFood
    console.log(selectPlayer(User0).continent);
    expect(selectPlayer(User0).ended, 'User0.ended 0').equal(true);

    clientStore1.dispatch(traitActivateRequest('$A', 'TraitFatTissue')); // A used fat

    expect(selectGame().status.turn, 'status.turn').equal(1);
    expect(selectGame().status.phase, 'status.phase').equal(PHASE.DEPLOY);
    expect(ClientGame0().status.turn, 'ClientGame0().status.turn').equal(1);
    expect(ClientGame0().status.turn, 'ClientGame0().status.phase').equal(PHASE.DEPLOY);

    expect(selectPlayer(User0).continent).size(1);
    expect(ClientGame0().getPlayer(User0).continent).size(1);
    expect(ClientGame1().getPlayer(User0).continent).size(1);
    expect(ClientGame2().getPlayer(User0).continent).size(1);
    expect(selectAnimal(User0, 0).getFood()).equal(0);

    expect(selectPlayer(User1).continent).size(2);
    expect(ClientGame0().getPlayer(User1).continent).size(2);
    expect(ClientGame1().getPlayer(User1).continent).size(2);
    expect(ClientGame2().getPlayer(User1).continent).size(2);
    expect(selectAnimal(User1, 0).getFood()).equal(0);
    expect(selectAnimal(User1, 1).getFood()).equal(0);

    expect(selectPlayer(User2).continent).size(0);
    expect(ClientGame0().getPlayer(User2).continent).size(0);
    expect(ClientGame1().getPlayer(User2).continent).size(0);
    expect(ClientGame2().getPlayer(User2).continent).size(0);


    expect(selectPlayer(User0).hand).size(2);
    expect(selectPlayer(User1).hand).size(3);
    expect(selectPlayer(User2).hand).size(6);
  });

  it('Next deploy: (not full DECK)', () => {
    const [{serverStore, ParseGame}
      , {clientStore0, User0, ClientGame0}
      , {clientStore1, User1, ClientGame1}
      , {clientStore2, User2, ClientGame2}] = mockGame(3);
    const gameId = ParseGame(`
deck: 4 carn
food: 4
phase: 2
players:
  - continent: $
  - continent: $
  - continent: $
`);
    const {selectGame, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    expect(selectPlayer(User0).continent).size(1);
    expect(selectPlayer(User1).continent).size(1);
    expect(selectPlayer(User2).continent).size(1);
    expect(selectPlayer(User0).hand).size(1);
    expect(selectPlayer(User1).hand).size(2);
    expect(selectPlayer(User2).hand).size(1);
  });

  it('Next deploy: (empty deck)', () => {
    const [{serverStore, ServerGame, ParseGame}
      , {clientStore0, User0, ClientGame0}
      , {clientStore1, User1, ClientGame1}
      , {clientStore2, User2, ClientGame2}] = mockGame(3);
    ParseGame(`
food: 0
phase: 2
players:
  - continent: $ + , $
  - continent: $ + camo sharp
  - continent: $ + comm$X, $X +,$,$
`);
    expect(ServerGame().getPlayer(User0).countScore(), 'score for User0 before').equal(4);
    expect(ServerGame().getPlayer(User1).countScore(), 'score for User1 before').equal(4);
    expect(ServerGame().getPlayer(User2).countScore(), 'score for User2 before').equal(9);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayer(User0).countScore(), 'score for User0 after').equal(2);
    expect(ServerGame().getPlayer(User1).countScore(), 'score for User1 after').equal(4);
    expect(ServerGame().getPlayer(User2).countScore(), 'score for User2 after').equal(5);
    expect(ServerGame().status.phase).equal(PHASE.FINAL);
  });

  it('User0, User1 in Game, User0 exits game, User1 win', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(``);
    clientStore0.dispatch(roomExitRequest());
    expect(ServerGame().status.phase, 'PHASE.FINAL').equal(PHASE.FINAL);
    expect(ServerGame().winnerId).equal(User1.id);
    expect(ClientGame1().status.phase, 'PHASE.FINAL').equal(PHASE.FINAL);
    expect(ClientGame1().winnerId).equal(User1.id);
  });

  it('User0, User1 in Game, User0 disconnects, User1 win', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(``);
    clientStore0.disconnect(SOCKET_DISCONNECT_NOW);
    expect(ServerGame().status.phase, 'PHASE.FINAL').equal(PHASE.FINAL);
    expect(ServerGame().winnerId).equal(User1.id);
    expect(ClientGame1().status.phase, 'PHASE.FINAL').equal(PHASE.FINAL);
    expect(ClientGame1().winnerId).equal(User1.id);
  });

  it('Spectators can exit after finish', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}, {clientStore2, User2}] = mockStores(3);
    clientStore0.dispatch(roomCreateRequest());

    const roomId = serverStore.getState().get('rooms').first().id;

    clientStore1.dispatch(roomJoinRequest(roomId));
    clientStore2.dispatch(roomSpectateRequest(roomId));
    clientStore0.dispatch(roomSetSeedRequest(`
deck: 2 camo
phase: 0
`));
    clientStore0.dispatch(roomStartVotingRequest());
    clientStore1.dispatch(roomStartVoteActionRequest(true));

    const gameId = serverStore.getState().get('rooms').first().gameId;
    const {selectGame, selectPlayer, selectCard} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));
    clientStore1.dispatch(gameDeployAnimalRequest(selectCard(User1, 0).id, 0));

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    expect(selectGame().status.phase).equal(PHASE.FINAL);

    clientStore0.dispatch(roomExitRequest());
    clientStore1.dispatch(roomExitRequest());

    expect(clientStore0.getState().get('game')).null;
    expect(clientStore1.getState().get('game')).null;
    expect(clientStore2.getState().get('game')).ok;

    clientStore2.dispatch(roomExitRequest());

    expect(clientStore2.getState().get('game')).null;
    expect(clientStore2.getState().get('room')).null;
  });
});