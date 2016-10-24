import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '../actions';
import {makeGameActionHelpers} from '../generic';
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

      expect(selectCard(User0, 0).trait2.type).equal('TraitFatTissue');

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
    it('FatTissue test', () => {
      const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 12 camo
phase: 2
food: 12
players:
  - continent: $ fat carn, $ fat fat fat
  - continent: $, $
`);
      const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
      const {activateTrait} = makeGameActionHelpers(serverStore.getState, gameId);

      //console.log(`User0: [${selectAnimal(User0, 0).id}, ${selectAnimal(User0, 1).id}]`)
      //console.log(`User0: [${selectAnimal(User0, 1).id}, ${selectAnimal(User1, 1).id}]`)

      expect(selectTrait(User0, 0, 0).type).equal('TraitFatTissue');

      clientStore0.dispatch(traitTakeFoodRequest(selectAnimal(User0, 0).id));
      clientStore0.dispatch(gameEndTurnRequest());
      clientStore1.dispatch(gameEndTurnRequest());
      //$+ fat carn, $ fat fat

      clientStore0.dispatch(traitTakeFoodRequest(selectAnimal(User0, 0).id));
      clientStore0.dispatch(gameEndTurnRequest());
      //$++ fat carn, $ fat fat

      clientStore0.dispatch(activateTrait(User0, 0, 'TraitCarnivorous', User1, 0));
      clientStore0.dispatch(gameEndTurnRequest());
      expect(selectPlayer(User1).continent).size(1);

      // selectAnimal(User0, 1)

      clientStore0.dispatch(traitTakeFoodRequest(selectAnimal(User0, 1).id));
      clientStore0.dispatch(gameEndTurnRequest());
      clientStore0.dispatch(traitTakeFoodRequest(selectAnimal(User0, 1).id));
      clientStore0.dispatch(gameEndTurnRequest());
      clientStore0.dispatch(traitTakeFoodRequest(selectAnimal(User0, 1).id));
      clientStore0.dispatch(gameEndTurnRequest());
      clientStore0.dispatch(traitTakeFoodRequest(selectAnimal(User0, 1).id));
      clientStore0.dispatch(gameEndTurnRequest());
      expect(selectAnimal(User0, 1).getFood()).equal(4);

      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectAnimal(User0, 1).getFood()).equal(3);

      expect(selectGame().status.phase, 'Turn 2, deploy').equal(1);
      clientStore1.dispatch(gameEndTurnRequest());
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.phase, 'Turn 2, feed').equal(2);
      clientStore1.dispatch(gameEndTurnRequest());
      clientStore0.dispatch(gameEndTurnRequest());

      expect(selectGame().status.phase).equal(1);
      expect(selectPlayer(User0).continent).size(1);
      expect(selectAnimal(User0, 0).traits).size(3);
      expect(selectAnimal(User0, 0).getFood()).equal(3);
      expect(selectPlayer(User1).continent).size(0);
    });
  });
});