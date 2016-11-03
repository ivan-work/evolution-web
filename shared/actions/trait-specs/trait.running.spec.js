import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitMimicryAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import {replaceGetRandom} from '../../utils/randomGenerator';

import {makeGameActionHelpers} from '../generic';
import {makeGameSelectors} from '../../selectors';

describe('TraitRunning:', () => {
  it('carn > running', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: carn, carn, carn, carn, carn, carn
  - continent: running
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    const {activateTrait} = makeGameActionHelpers(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitRunning');

    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(activateTrait(User0, 1, 'TraitCarnivorous', User1, 0));

      expect(ServerGame().getPlayer(User0).acted, 'User0 has acted').true;
      expect(ServerGame().status.phase).equal(PHASE.FEEDING);

      clientStore0.dispatch(gameEndTurnRequest());
      clientStore1.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(activateTrait(User0, 2, 'TraitCarnivorous', User1, 0));
      clientStore0.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(activateTrait(User0, 3, 'TraitCarnivorous', User1, 0));
      clientStore0.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(activateTrait(User0, 4, 'TraitCarnivorous', User1, 0));
      clientStore0.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(activateTrait(User0, 5, 'TraitCarnivorous', User1, 0));
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectAnimal(User1, 0)).ok;
    });

    replaceGetRandom(() => 0, () => {
      expectUnchanged('CHANGEIT', () => clientStore0.dispatch(activateTrait(User0, 1, 'TraitCarnivorous', User1, 0)), serverStore, clientStore0);
      clientStore0.dispatch(activateTrait(User0, 0, 'TraitCarnivorous', User1, 0));
      expect(selectAnimal(User0, 0).getFood()).equal(2);
      expect(selectAnimal(User1, 0)).undefined;
    });
  });
});






















