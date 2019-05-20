import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , testHackGame
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitFatTissue:', () => {
  describe('Deploy:', () => {
    it('Can deploy multiple', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
phase: deploy
players:
  - hand: 2 CardGrazingAndFatTissue
    continent: $
`);
      const {selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

      expect(selectCard(User0, 0).trait2).equal('TraitFatTissue');

      clientStore0.dispatch(gameDeployTraitRequest(
        selectCard(User0, 0).id
        , selectAnimal(User0, 0).id
        , true
      ));
      clientStore1.dispatch(gameEndTurnRequest());
      clientStore0.dispatch(gameDeployTraitRequest(
        selectCard(User0, 0).id
        , selectAnimal(User0, 0).id
        , true
      ));

      expect(selectAnimal(User0, 0).traits, 'Animal can have two fats').size(2);
      expect(selectTrait(User0, 0, 0).type).equal('TraitFatTissue');
      expect(selectTrait(User0, 0, 1).type).equal('TraitFatTissue');
    });
  });
  describe('Feeding:', () => {
    it('FatTissue activation', () => {
      const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
deck: 12 camo
phase: feeding
food: 12
players:
  - continent: $A mass fat=true fat=true fat=true fat=true ++, $B fat=true +, $Waiter graz +
`);
      const {selectGame, selectCard, findAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      expect(findAnimal('$A').getFood()).equal(2);
      expect(findAnimal('$A').getFat()).equal(4);
      clientStore0.dispatch(gameEndTurnRequest());
      clientStore0.dispatch(gameEndTurnRequest());
      expect(selectGame().status.turn, 'Turn 1').equal(1);
      expect(selectGame().status.phase, 'PHASE.FEEDING').equal(PHASE.FEEDING);

      expect(findAnimal('$A').getFood()).equal(0);
      expect(findAnimal('$A').getFat()).equal(4);

      clientStore0.dispatch(traitActivateRequest('$A', selectTrait(User0, 0, 2).id));

      expect(findAnimal('$A').getFood()).equal(2);
      expect(findAnimal('$A').getFat()).equal(2);

      expectUnchanged('Animal $A cant take food now', () =>
          clientStore0.dispatch(traitTakeFoodRequest('$A'))
        , serverStore, clientStore0);

      expectUnchanged('Animal $A cant reactivate', () => {
        clientStore0.dispatch(traitActivateRequest('$A', selectTrait(User0, 0, 1).id));
        clientStore0.dispatch(traitActivateRequest('$A', selectTrait(User0, 0, 3).id));
        clientStore0.dispatch(traitActivateRequest('$B', selectTrait(User0, 0, 0).id));
      }, serverStore, clientStore0);
    });

    it('FatTissue waiting', () => {
      const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
deck: 12 camo
phase: feeding
food: 0
players:
  - continent: $A fat=true wait, $B
`);
      const {selectGame, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.phase).equal(PHASE.DEPLOY);
      expect(findAnimal('$A')).null;
    });
  });
});