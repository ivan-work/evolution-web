import {Map, List} from 'immutable';

import {
  gameDeployTraitRequest
  , gameDeployAnimalRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , SOCKET_DISCONNECT_NOW
} from '../actions';

import {replaceGetRandom} from '../../utils/randomGenerator';

import {PHASE} from '../../../shared/models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('Game (LEAVERS):', function () {
  it('Deploy, User1 leaves', () => {
    const [{serverStore, ParseGame}
      , {clientStore0, User0, ClientGame0}
      , {clientStore1, User1, ClientGame1}
      , {clientStore2, User2, ClientGame2}] = mockGame(3);
    const gameId = ParseGame(`
phase: 0
deck: 50 camo
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(0);

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));
    clientStore1.dispatch(gameDeployAnimalRequest(selectCard(User1, 0).id, 0));
    clientStore2.dispatch(gameDeployAnimalRequest(selectCard(User2, 0).id, 0));

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));
    clientStore1.disconnect(SOCKET_DISCONNECT_NOW);
    expect(selectPlayer(User1).ended, 'User1 should ended if left').true;
    clientStore2.dispatch(gameDeployAnimalRequest(selectCard(User2, 0).id, 0));

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));
    clientStore2.dispatch(gameDeployAnimalRequest(selectCard(User2, 0).id, 0));

    expect(selectGame().getIn(['status', 'turn']), 'turn').equal(0);
    expect(selectGame().getIn(['status', 'phase']), 'PHASE.DEPLOY').equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer']), 'currentPlayer').equal(0);
    expect(selectGame().getPlayer(User0).continent).size(3);
    expect(selectGame().getPlayer(User1).continent).size(1);
    expect(selectGame().getPlayer(User2).continent).size(3);
  });

  it('User0 leaves before feeding starts', () => {
    const [{serverStore, ParseGame}
      , {clientStore0, User0, ClientGame0}
      , {clientStore1, User1, ClientGame1}
      , {clientStore2, User2, ClientGame2}] = mockGame(3);
    const gameId = ParseGame(`
phase: 0
deck: 50 camo
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(0);

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));
    clientStore1.dispatch(gameDeployAnimalRequest(selectCard(User1, 0).id, 0));
    clientStore2.dispatch(gameDeployAnimalRequest(selectCard(User2, 0).id, 0));

    clientStore0.disconnect(SOCKET_DISCONNECT_NOW);
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    expect(selectGame().getIn(['status', 'turn']), 'turn').equal(0);
    expect(selectGame().getIn(['status', 'phase']), 'PHASE.FEEDING').equal(PHASE.FEEDING);
    expect(selectGame().getIn(['status', 'currentPlayer']), 'currentPlayer').equal(1);
  });

  it(`Handle game with leaver`, () => {
    const [{serverStore, ParseGame}
      , {clientStore0, User0, ClientGame0}
      , {clientStore1, User1, ClientGame1}
      , {clientStore2, User2, ClientGame2}] = mockGame(3);
    const gameId = ParseGame(`
phase: 2
food: 5
deck: 50 camo
players:
  - hand: 5 camo
    continent: $Q +, $W
  - continent: $A +, $S
  - continent: $Z +, $X
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().getIn(['status', 'turn'])).equal(0);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.FEEDING);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(0);

    //replaceGetRandom(() => )
    clientStore0.disconnect(SOCKET_DISCONNECT_NOW);
    expect(selectPlayer(User0).hand, 'empties hand after leave').size(0);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(1);

    clientStore1.dispatch(traitTakeFoodRequest('$S'));
    clientStore2.dispatch(traitTakeFoodRequest('$X'));

    expect(selectGame().getIn(['status', 'turn'])).equal(1);
    expect(selectGame().getIn(['status', 'phase'])).equal(PHASE.DEPLOY);
    expect(selectGame().getIn(['status', 'currentPlayer'])).equal(1);
    expect(selectPlayer(User0).hand).size(0);
    expect(selectPlayer(User1).hand).size(3);
    expect(selectPlayer(User2).hand).size(3);
  });
});