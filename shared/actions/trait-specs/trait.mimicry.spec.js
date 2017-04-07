import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameActionHelpers} from '../generic';
import {makeGameSelectors} from '../../selectors';

describe.skip('TraitMimicry:', () => {
  describe('Feeding:', () => {
    it('Simple', () => {
      const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: 2
players:
  - continent: $ carn
  - continent: $ mimicry, $
`);
      const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      const {activateTrait} = makeGameActionHelpers(serverStore.getState, gameId);

      expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');

      clientStore0.dispatch(activateTrait(User0, 0, 'TraitCarnivorous', User1, 0));

      clientStore1.dispatch(activateTrait(User1, 0, 'TraitMimicry', User1, 1));

      expect(clientStore0)
    });

//    it('Dodges attack', () => {
//      const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
//      const gameId = ParseGame(`
//phase: 2
//players:
//  - continent: $ carn
//  - continent: $ mimicry, $
//`);
//      const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
//      const {activateTrait} = makeGameActionHelpers(serverStore.getState, gameId);
//
//      expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
//
//      clientStore0.dispatch(activateTrait(User0, 0, 'TraitCarnivorous', User1, 0));
//
//      clientStore1.dispatch(gameEndTurnRequest());
//    });
  });
});