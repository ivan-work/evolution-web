import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
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
      clientStore0.dispatch(traitActivateRequest(selectAnimal(User0, 1).id, 'TraitCarnivorous', selectAnimal(User1, 0).id));
      expect(selectAnimal(User1, 0), 'Animal ran away').ok;

      expect(ServerGame().getPlayer(User0).acted, 'User0 has acted').true;
      expect(ServerGame().status.phase).equal(PHASE.FEEDING);

      clientStore0.dispatch(gameEndTurnRequest());
      clientStore1.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(traitActivateRequest(selectAnimal(User0, 2).id, 'TraitCarnivorous', selectAnimal(User1, 0).id));
      expect(selectAnimal(User1, 0)).ok;
      clientStore0.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(traitActivateRequest(selectAnimal(User0, 3).id, 'TraitCarnivorous', selectAnimal(User1, 0).id));
      expect(selectAnimal(User1, 0)).ok;
      clientStore0.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(traitActivateRequest(selectAnimal(User0, 4).id, 'TraitCarnivorous', selectAnimal(User1, 0).id));
      expect(selectAnimal(User1, 0)).ok;
      clientStore0.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(traitActivateRequest(selectAnimal(User0, 5).id, 'TraitCarnivorous', selectAnimal(User1, 0).id));
      expect(selectAnimal(User1, 0)).ok;
      clientStore0.dispatch(gameEndTurnRequest());
    });

    replaceGetRandom(() => 0, () => {
      expectUnchanged('Hunter has cooldown', () =>
        clientStore0.dispatch(traitActivateRequest(selectAnimal(User0, 1).id, 'TraitCarnivorous', selectAnimal(User1, 0).id))
        , serverStore, clientStore0);
      clientStore0.dispatch(traitActivateRequest(selectAnimal(User0, 0).id, 'TraitCarnivorous', selectAnimal(User1, 0).id));
      expect(selectAnimal(User0, 0).getFood(), 'User0, 0 gets food').equal(2);
      expect(selectAnimal(User1, 0)).undefined;
    });
  });
});






















