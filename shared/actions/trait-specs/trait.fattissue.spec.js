import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitFatTissue:', () => {
  describe('Deploy:', () => {
    it('Can deploy multiple', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
phase: 1
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
  describe.only('Feeding:', () => {
    it('FatTissue test', () => {
      const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 12 camo
phase: 2
food: 12
players:
  - continent: $A fat carn, $B fat fat fat, $Waiter
    hand: 1 CardGrazingAndFatTissue
  - continent: $C, $D
`);
      const {selectGame, selectCard, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

      expect(selectTrait(User0, 0, 0).type).equal('TraitFatTissue');

      clientStore0.dispatch(traitTakeFoodRequest('$A'));
      clientStore1.dispatch(gameEndTurnRequest());
      //$A+ fat carn, $B fat fat

      clientStore0.dispatch(traitTakeFoodRequest('$A'));
      //$A++ fat carn, $B fat fat

      clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$C'));
      expect(selectPlayer(User1).continent).size(1);

      // selectAnimal(User0, 1)

      console.log('Turn 1 User0 start', selectPlayer(User0).continent);
      console.log('Turn 1 User1 start', selectPlayer(User1).continent);

      clientStore0.dispatch(traitTakeFoodRequest('$B'));
      clientStore0.dispatch(traitTakeFoodRequest('$B'));
      clientStore0.dispatch(traitTakeFoodRequest('$B'));
      clientStore0.dispatch(traitTakeFoodRequest('$B'));

      expect(selectAnimal(User0, 0).getFoodAndFat()).equal(3);
      expect(selectAnimal(User0, 1).getFoodAndFat()).equal(4);

      clientStore0.dispatch(traitTakeFoodRequest('$Waiter'));

      expect(selectGame().status.phase, 'Turn 2, deploy').equal(PHASE.DEPLOY);
      clientStore1.dispatch(gameEndTurnRequest());
      console.log('Turn 2 start', selectPlayer(User0).continent);

      clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$B', true));
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.phase, 'Turn 2, feed').equal(PHASE.FEEDING);
      console.log('Turn 2 end', selectPlayer(User0).continent);
      clientStore0.dispatch(gameEndTurnRequest());


      expect(selectGame().status.phase, 'Turn 3, deploy').equal(PHASE.DEPLOY);
      expect(selectGame().status.turn, 'Turn 3, deploy turn').equal(2);

      console.log('Turn 3 start', selectPlayer(User0).continent);

      expect(selectPlayer(User0).continent).size(1);
      expect(selectAnimal(User0, 0).traits).size(4);
      expect(selectAnimal(User0, 0).getFoodAndFat(), 'food').equal(2);
      expect(selectTrait(User0, 0, 0).value, '0').equal(false);
      expect(selectTrait(User0, 0, 1).value, '1').equal(true);
      expect(selectTrait(User0, 0, 2).value, '2').equal(true);
      expect(selectTrait(User0, 0, 3).value, '3').equal(false);

      expect(selectPlayer(User1).continent).size(0);
    });
  });
});