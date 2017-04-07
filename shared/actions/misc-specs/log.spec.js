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
  it('Typical game', () => {
    const [{ParseGame, serverStore}, {clientStore0, User0}, {clientStore1, User1}, {clientStore2, User2}] = mockGame(3);
    const gameId = ParseGame(`
phase: 0
deck: 32 fat
players:
  - continent: $Q Camouflage Scavenger Communication$W, $W TailLoss Grazing Piracy, $E Carnivorous FatTissue, $R Symbiosis$T Cooperation$T, $T Mimicry Running, $Y Poisonous Hibernation
  - continent: $A Camouflage Scavenger Communication$S, $S TailLoss Grazing Piracy, $D Carnivorous FatTissue, $F Symbiosis$G Cooperation$G, $G Mimicry Running, $H Poisonous Hibernation
  - continent: $Z Camouflage Scavenger Communication$X, $X TailLoss Grazing Piracy, $C Carnivorous FatTissue, $V Symbiosis$B Cooperation$B, $B Mimicry Running, $N Poisonous Hibernation
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

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 1));

    replaceGetRandom(() => 6, () => {
      clientStore0.dispatch(gameEndTurnRequest());
    });
    let i = 0;
    expect(selectGame().log.get(i++)).eql(['gameGiveCards', User0.id, 7]);
    expect(selectGame().log.get(i++)).eql(['gameGiveCards', User1.id, 7]);
    expect(selectGame().log.get(i++)).eql(['gameGiveCards', User2.id, 7]);
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
    expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User0.id]);
    expect(selectGame().log.get(i++)).eql(['gameEndTurn', User0.id, true, false]);
    expect(selectGame().log.get(i++)).eql(['gameStartEat', 12]);
    expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User0.id]);

    /**
     * FEEDING
     */

    clientStore0.dispatch(traitActivateRequest('$W', 'TraitGrazing'));
    clientStore0.dispatch(traitActivateRequest('$Y', 'TraitHibernation'));
    clientStore0.dispatch(traitTakeFoodRequest('$T'));
    replaceGetRandom(() => 0, () => {
      clientStore1.dispatch(traitActivateRequest('$D', 'TraitCarnivorous', '$T'));
    });
    clientStore0.dispatch(traitDefenceAnswerRequest('TraitMimicry', '$Y'));
    console.log(selectGame().log.toJS());

    expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$W', 'TraitGrazing', null]);
    expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$Y', 'TraitHibernation', null]);
    expect(selectGame().log.get(i++)).eql(['traitMoveFoodGAME', '$T', 1, 'GAME', void 0]);
    expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$T', 'TraitCooperation', selectTrait0(5, 1).id]);
    expect(selectGame().log.get(i++)).eql(['traitMoveFoodGAME', '$R', 1, 'GAME', '$T']);
    expect(selectGame().log.get(i++)).eql(['gameEndTurn', User0.id, false, false]);
    expect(selectGame().log.get(i++)).eql(['gameNextPlayer', User1.id]);
    expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$D', 'TraitCarnivorous', '$T']);
    expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$T', 'TraitMimicry', '$Y']);
    expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$D', 'TraitCarnivorous', '$Y']);
    expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$Y', 'TraitPoisonous', '$D']);
    expect(selectGame().log.get(i++)).eql(['traitMoveFoodANIMAL_HUNT', '$D', 2, 'ANIMAL_HUNT', '$Y']);
    expect(selectGame().log.get(i++)).eql(['traitMoveFoodundefined', '$A', 1, undefined, undefined]);
    expect(selectGame().log.get(i++)).eql(['traitNotify_Start', '$A', 'TraitCommunication', selectTrait1(1, 3).id]);
    expect(selectGame().log.get(i++)).eql(['traitMoveFoodANIMAL_COPY', '$S', 1, 'ANIMAL_COPY', '$A']);


  });
});