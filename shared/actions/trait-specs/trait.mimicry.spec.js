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
    it('$A > $B > $C', () => {
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
    it.only('$A > $B > $C > $B', () => {
      const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C mimicry
`);
      const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      const {activateTrait} = makeGameActionHelpers(serverStore.getState, gameId);

      expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');

      //console.log(selectAnimal(User0, 0))
      //console.log(selectAnimal(User1, 0))
      //console.log(selectAnimal(User1, 1))

      clientStore0.dispatch(activateTrait(User0, 0, 'TraitCarnivorous', User1, 0));

      clientStore1.dispatch(traitMimicryAnswer(
        User0.id, '$A'
        , 'TraitCarnivorous'
        , User1.id, '$B'
        , User1.id, '$C'));

      clientStore1.dispatch(traitMimicryAnswer(
        User0.id, '$A'
        , 'TraitCarnivorous'
        , User1.id, '$C'
        , User1.id, '$B'));

      expect(selectAnimal(User0, 0).getFood()).equal(2);
      expect(selectAnimal(User1, 0).id).equal('$C');
      expect(selectAnimal(User1, 1)).undefined;
    });
  });
});