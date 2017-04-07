import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitMimicryAnswer
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameActionHelpers} from '../generic';
import {makeGameSelectors} from '../../selectors';

describe.only('TraitMimicry:', () => {
  describe('Feeding:', () => {
    it('Simple', () => {
      const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C
`);
      const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      const {activateTrait} = makeGameActionHelpers(serverStore.getState, gameId);

      expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');

      //console.log(selectAnimal(User0, 0))
      //console.log(selectAnimal(User1, 0))
      //console.log(selectAnimal(User1, 1))

      clientStore0.dispatch(activateTrait(User0, 0, 'TraitCarnivorous', User1, 0));

      clientStore1.dispatch(traitMimicryAnswer(
        User0.id, selectAnimal(User0, 0).id
        , 'TraitCarnivorous'
        , User1.id, selectAnimal(User1, 0).id
        , User1.id, selectAnimal(User1, 1).id));

      expect(selectAnimal(User0, 0).getFood()).equal(2);
      expect(selectAnimal(User1, 0).id).equal('$B');
      expect(selectAnimal(User1, 1)).undefined;
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