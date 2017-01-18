import {
  gameEndTurnRequest
  , gameDeployTraitRequest
  , gameDeployAnimalRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitDefenceAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import {replaceGetRandom} from '../../utils/randomGenerator';

import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';

describe.only('Logging test:', () => {
  it('Typical game', async() => {
    const [{ParseGame, serverStore}, {clientStore0, User0}, {clientStore1, User1}, {clientStore2, User2}] = mockGame(3);
    const gameId = ParseGame(`
phase: 0
deck: 32 fat
players:
  - continent: $Q Carnivorous, $W Carnivorous
  - continent: $A Camouflage Scavenger Communication$S, $S TailLoss Grazing, $D Carnivorous FatTissue Piracy, $F Symbiosis$G Cooperation$G, $G Mimicry Running, $H Poisonous Hibernation
  - continent: $Z Carnivorous, $X Carnivorous, $C Carnivorous
`);
    const {selectGame, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, selectAnimal0, selectTrait0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const {selectGame1, selectAnimal1, selectTrait1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);
    const {selectGame2, selectAnimal2, selectTrait2} = makeClientGameSelectors(clientStore2.getState, gameId, 2);

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));

    clientStore1.dispatch(gameEndTurnRequest());

    clientStore2.dispatch(gameDeployAnimalRequest(selectCard(User2, 0).id, 0));

    clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, selectAnimal(User0, 0).id, true));

    clientStore2.dispatch(gameEndTurnRequest());

    replaceGetRandom(() => 6, () => {
      clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 1));
    });

    /**
     * FEEDING
     */
    clientStore0.dispatch(traitTakeFoodRequest('$Q'));

    clientStore1.dispatch(traitActivateRequest('$S', 'TraitGrazing'));
    clientStore1.dispatch(traitActivateRequest('$H', 'TraitHibernation'));
    clientStore1.dispatch(traitActivateRequest('$D', 'TraitPiracy', '$Q'));
    clientStore1.dispatch(traitTakeFoodRequest('$G'));

    replaceGetRandom(() => 1, () => {
      clientStore2.dispatch(traitActivateRequest('$Z', 'TraitCarnivorous', '$G'));
    });
    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$S'));
    const traitTailLossId = selectTrait1(1, 0).id;
    clientStore1.dispatch(traitDefenceAnswerRequest('TraitTailLoss', traitTailLossId));

    clientStore1.dispatch(traitTakeFoodRequest('$D'));
    clientStore1.dispatch(gameEndTurnRequest());

    replaceGetRandom(() => 0, () => {
      clientStore2.dispatch(traitActivateRequest('$X', 'TraitCarnivorous', '$G'));
    });

    clientStore1.dispatch(traitDefenceAnswerRequest('TraitMimicry', '$H'));

    const checkLog = (selectGame) => {
      let i = 0;
      expect(selectGame().log.get(i++)).eql(['gameGiveCards', User0.id, 3]);
      expect(selectGame().log.get(i++)).eql(['gameGiveCards', User1.id, 7]);
      expect(selectGame().log.get(i++)).eql(['gameGiveCards', User2.id, 4]);
      expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User0.id]);
      expect(selectGame().log.get(i++)).eql(['gameDeployAnimal', User0.id]);
      expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User1.id]);
      expect(selectGame().log.get(i++)).eql(['gameEndTurn', User1.id, true, false]);

      expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User2.id]);
      expect(selectGame().log.get(i++)).eql(['gameDeployAnimal', User2.id]);
      expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User0.id]);
      expect(selectGame().log.get(i++)).eql(['gameDeployTrait', User0.id, 'TraitFatTissue', selectAnimal(User0, 0).id]);
      expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User2.id]);
      expect(selectGame().log.get(i++)).eql(['gameEndTurn', User2.id, true, false]);

      expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User0.id]);
      expect(selectGame().log.get(i++)).eql(['gameDeployAnimal', User0.id]);
      expect(selectGame().log.get(i++)).eql(['gameEndTurn', User0.id, true, false]);
      expect(selectGame().log.get(i++)).eql(['gameStartEat', 12]);
      expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User0.id]);

      expect(selectGame().log.get(i++)).eql(['traitMoveFood', '$Q', 1, 'GAME', void 0]);
      expect(selectGame().log.get(i++)).eql(['gameEndTurn', User0.id, false, false]);

      expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User1.id]);
      expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$S', 'TraitGrazing', null]);
      expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$H', 'TraitHibernation', null]);
      expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$D', 'TraitPiracy', '$Q']);
      expect(selectGame().log.get(i++)).eql(['traitMoveFood', '$D', 1, 'TraitPiracy', '$Q']);
      expect(selectGame().log.get(i++)).eql(['traitMoveFood', '$G', 1, 'GAME', void 0]);
      expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$G', 'TraitCooperation', selectTrait1(3, 1).id]);
      expect(selectGame().log.get(i++)).eql(['traitMoveFood', '$F', 1, 'GAME', '$G']);
      expect(selectGame().log.get(i++)).eql(['gameEndTurn', User1.id, false, false]);

      expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User2.id]);
      expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$Z', 'TraitCarnivorous', '$G']);
      expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$G', 'TraitRunning', '$Z']);
      expect(selectGame().log.get(i++)).eql(['gameEndTurn', User2.id, false, false]);

      expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User0.id]);
      expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$Q', 'TraitCarnivorous', '$S']);
      expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$S', 'TraitTailLoss', traitTailLossId]);
      expect(selectGame().log.get(i++)).eql(['traitMoveFood', '$Q', 1, 'TraitTailLoss', '$S']);
      expect(selectGame().log.get(i++)).eql(['gameEndTurn', User0.id, false, false]);

      expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User1.id]);
      expect(selectGame().log.get(i++)).eql(['traitMoveFood', '$D', 1, 'GAME', void 0]);
      expect(selectGame().log.get(i++)).eql(['gameEndTurn', User1.id, false, false]);

      expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User2.id]);
      expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$X', 'TraitCarnivorous', '$G']);
      expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$G', 'TraitMimicry', '$H']);
      expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$X', 'TraitCarnivorous', '$H']);
      expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$H', 'TraitPoisonous', '$X']);
      expect(selectGame().log.get(i++)).eql(['traitMoveFood', '$X', 2, 'TraitCarnivorous', '$H']);
      expect(selectGame().log.get(i++)).eql(['traitMoveFood', '$A', 1, 'TraitScavenger', '$X']);
      expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$A', 'TraitCommunication', selectTrait1(1, 1).id]);
      expect(selectGame().log.get(i++)).eql(['traitMoveFood', '$S', 1, 'TraitCommunication', '$A']);
      expect(selectGame().log.get(i++)).eql(['gameEndTurn', User2.id, false, false]);
      expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User0.id]);
    };
    checkLog(selectGame);
    checkLog(selectGame0);
  });
});