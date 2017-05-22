import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';
import {replaceGetRandom} from '../../utils/randomGenerator';

import {makeGameSelectors} from '../../selectors';

describe('TraitRunning:', () => {
  it('carn > running', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 0
players:
  - continent: $A carn waiter, $B carn, $C carn, $Runner running
`);
    const {selectPlayer, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(findTrait('$Runner', tt.TraitRunning)).ok;

    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$Runner'));
      expect(findAnimal('$Runner'), '$Runner ran away').ok;

      expect(ServerGame().getPlayer(User0).acted, 'User0 has acted').true;
      expect(ServerGame().status.phase).equal(PHASE.FEEDING);

      clientStore0.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$Runner'));
      expect(findAnimal('$Runner'), '$Runner ran away').ok;
      clientStore0.dispatch(gameEndTurnRequest());
    });

    replaceGetRandom(() => 0, () => {
      expectUnchanged('Hunter has cooldown', () =>
        clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$Runner'))
        , serverStore, clientStore0);
      clientStore0.dispatch(traitActivateRequest('$C', 'TraitCarnivorous', '$Runner'));
      expect(findAnimal('$C').getFoodAndFat(), '$C gets food').equal(2);
      expect(findAnimal('$Runner')).null;
    });
  });
});






















