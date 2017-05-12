import {
  gameEndTurnRequest
  , gameDeployTraitRequest
  , gameDeployAnimalRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import {replaceGetRandom} from '../../utils/randomGenerator';

import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';

import {logAnimal} from '../../../server/reducers/games-rdx-server';

describe('Logging test:', () => {

//   Bullshit hell when i switched AnimalModel.traits from List to OrderedMap and it fucked up order
//   due to implicit conversion from OrderedMap to POJO over sockets
//   FFFUUUUUU
//
//   it.only('order', () => {
//     for (let i = 0; i < 100; ++i) {
//       const [{ParseGame, serverStore}, {clientStore0, User0}] = mockGame(1);
//       const gameId = ParseGame(`
// players:
//   - continent: $A Camouflage Scavenger Communication$S FatTissue Hibernation Running, $S TailLoss Grazing
// `);
//       const animal = serverStore.getState().getIn(['games', gameId, 'players', User0.id, 'continent', 0]);
//       const animal0 = clientStore0.getState().getIn(['game', 'players', User0.id, 'continent', 0]);
//
//       console.log('good', animal)
//       console.log('baad', animal0)
//       // expect(animal.toClient()).equal(animal.toClient());
//       // expect(animal.traits).equal(animal0.traits);
//       // console.log(animal.traits.toArray().map(t => t.type))
//       // console.log(logAnimal(animal));
//       // expect(animal.traits.toArray().map(t => t.type))
//       //   .eql(['TraitCamouflage', 'TraitScavenger', 'TraitFatTissue', 'TraitHibernation', 'TraitRunning', 'TraitCommunication'])
//       // expect(logAnimal(animal))
//       //   .eql(['$Animal', 'TraitCamouflage', 'TraitScavenger', 'TraitFatTissue', 'TraitHibernation', 'TraitRunning', 'TraitCommunication'])
//       expect(logAnimal(animal0))
//         .eql(['$Animal', 'TraitCamouflage', 'TraitScavenger', 'TraitFatTissue', 'TraitHibernation', 'TraitRunning', 'TraitCommunication'])
//     }
//   });

  it('Typical game', async () => {
    const [{ParseGame, serverStore}, {clientStore0, User0}, {clientStore1, User1}, {clientStore2, User2}] = mockGame(3);
    const gameId = ParseGame(`
phase: 0
deck: 32 fat
players:
  - continent: $Q Carnivorous, $W Carnivorous
  - continent: $A Camouflage Scavenger Communication$S, $S TailLoss Grazing, $D Carnivorous FatTissue Piracy, $F Symbiosis$G Cooperation$G, $G Mimicry Running, $H Poisonous Hibernation
  - continent: $Z Carnivorous, $X Carnivorous, $C Carnivorous
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, selectAnimal0, selectTrait0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const {selectGame1, selectAnimal1, selectTrait1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);
    const {selectGame2, selectAnimal2, selectTrait2} = makeClientGameSelectors(clientStore2.getState, gameId, 2);

    replaceGetRandom(() => 3, () => {
      clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));

      clientStore1.dispatch(gameEndTurnRequest());

      clientStore2.dispatch(gameDeployAnimalRequest(selectCard(User2, 0).id, 0));

      clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, selectAnimal(User0, 0).id, true));

      clientStore2.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 1));
    });

    /**
     * FEEDING
     */
    expect(selectGame().food).equal(6);
    clientStore0.dispatch(traitTakeFoodRequest('$Q'));

    clientStore1.dispatch(traitActivateRequest('$S', 'TraitGrazing'));
    clientStore1.dispatch(traitActivateRequest('$H', 'TraitHibernation'));
    clientStore1.dispatch(traitActivateRequest('$D', 'TraitPiracy', '$Q'));
    clientStore1.dispatch(traitTakeFoodRequest('$G'));

    replaceGetRandom(() => 1, () => {
      clientStore2.dispatch(traitActivateRequest('$Z', 'TraitCarnivorous', '$G'));
    });

    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$S'));
    clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitTailLoss'));

    clientStore1.dispatch(traitActivateRequest('$S', 'TraitGrazing'));
    clientStore1.dispatch(traitTakeFoodRequest('$D'));
    //clientStore1.dispatch(gameEndTurnRequest());

    replaceGetRandom(() => 0, () => {
      clientStore2.dispatch(traitActivateRequest('$X', 'TraitCarnivorous', '$G'));
    });

    clientStore1.dispatch(traitAnswerRequest('TraitMimicry', '$H'));
    expect(selectGame().food, 'Food').equal(0);
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore2.dispatch(gameEndTurnRequest());

    const $Q = ['$Animal', 'TraitCarnivorous'];
    const $W = $Q;
    const $Z = $Q;
    const $X = $Q;

    const $A = ['$Animal', 'TraitCamouflage', 'TraitScavenger', 'TraitCommunication'];
    const $S = ['$Animal', 'TraitTailLoss', 'TraitGrazing', 'TraitCommunication'];
    const $S1 = ['$Animal', 'TraitGrazing', 'TraitCommunication'];
    const $D = ['$Animal', 'TraitCarnivorous', 'TraitFatTissue', 'TraitPiracy'];
    const $F = ['$Animal', 'TraitSymbiosis', 'TraitCooperation'];
    const $G = ['$Animal', 'TraitMimicry', 'TraitRunning', 'TraitSymbiosis', 'TraitCooperation'];
    const $H = ['$Animal', 'TraitPoisonous', 'TraitHibernation'];

    expect(logAnimal(selectGame().locateAnimal('$A').animal), 'A s').eql($A);
    expect(logAnimal(selectGame().locateAnimal('$S').animal), 'S s').eql($S1);
    expect(logAnimal(selectGame().locateAnimal('$D').animal), 'D s').eql($D);
    expect(logAnimal(selectGame().locateAnimal('$F').animal), 'F s').eql($F);
    expect(logAnimal(selectGame().locateAnimal('$G').animal), 'G s').eql($G);
    expect(logAnimal(selectGame0().locateAnimal('$A').animal), 'A c').eql($A);
    expect(logAnimal(selectGame0().locateAnimal('$S').animal), 'S c').eql($S1);
    expect(logAnimal(selectGame0().locateAnimal('$D').animal), 'D c').eql($D);
    expect(logAnimal(selectGame0().locateAnimal('$F').animal), 'F c').eql($F);
    expect(logAnimal(selectGame0().locateAnimal('$G').animal), 'G c').eql($G);

    const checkLog = (selectGame) => {
      let i = 0;
      expect(selectGame().log.get(i++).message).eql(['gameGiveCards', User0.id, 3]);
      expect(selectGame().log.get(i++).message).eql(['gameGiveCards', User1.id, 7]);
      expect(selectGame().log.get(i++).message).eql(['gameGiveCards', User2.id, 4]);
      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User0.id]);
      expect(selectGame().log.get(i++).message).eql(['gameDeployAnimal', User0.id]);
      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User1.id]);
      expect(selectGame().log.get(i++).message).eql(['gameEndTurn', User1.id, true, false]);

      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User2.id]);
      expect(selectGame().log.get(i++).message).eql(['gameDeployAnimal', User2.id]);
      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User0.id]);
      expect(selectGame().log.get(i++).message).eql(['gameDeployTrait', User0.id, 'TraitFatTissue', ['$Animal']]);
      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User2.id]);
      expect(selectGame().log.get(i++).message).eql(['gameEndTurn', User2.id, true, false]);

      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User0.id]);
      expect(selectGame().log.get(i++).message).eql(['gameDeployAnimal', User0.id]);
      expect(selectGame().log.get(i++).message).eql(['gameEndTurn', User0.id, true, false]);
      expect(selectGame().log.get(i++).message).eql(['gameStartEat', 6]);
      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User0.id]);

      expect(selectGame().log.get(i++).message).eql(['traitMoveFood', 1, 'GAME', $Q, null]);
      expect(selectGame().log.get(i++).message).eql(['gameEndTurn', User0.id, false, false]);

      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User1.id]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $S, 'TraitGrazing', void 0]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $H, 'TraitHibernation', void 0]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $D, 'TraitPiracy', $Q]);
      expect(selectGame().log.get(i++).message).eql(['traitMoveFood', 1, 'TraitPiracy', $D, $Q]);
      expect(selectGame().log.get(i++).message).eql(['traitMoveFood', 1, 'GAME', $G, null]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $G, 'TraitCooperation', $F]);
      expect(selectGame().log.get(i++).message).eql(['traitMoveFood', 1, 'GAME', $F, $G]);
      expect(selectGame().log.get(i++).message).eql(['gameEndTurn', User1.id, false, false]);

      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User2.id]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $Z, 'TraitCarnivorous', $G]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $G, 'TraitRunning', void 0]);
      expect(selectGame().log.get(i++).message).eql(['gameEndTurn', User2.id, false, false]);

      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User0.id]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $Q, 'TraitCarnivorous', $S]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $S, 'TraitTailLoss', 'TraitTailLoss']);
      expect(selectGame().log.get(i++).message).eql(['traitMoveFood', 1, 'TraitTailLoss', $Q, $S1]);
      expect(selectGame().log.get(i++).message).eql(['gameEndTurn', User0.id, false, false]);

      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User1.id]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $S1, 'TraitGrazing', void 0]);
      expect(selectGame().log.get(i++).message).eql(['traitMoveFood', 1, 'GAME', $D, null]);
      expect(selectGame().log.get(i++).message).eql(['gameEndTurn', User1.id, false, false]);

      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User2.id]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $X, 'TraitCarnivorous', $G]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $G, 'TraitMimicry', $H]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $X, 'TraitCarnivorous', $H]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $H, 'TraitPoisonous', $X]);
      expect(selectGame().log.get(i++).message).eql(['animalDeath', 'KILL', $H]);
      expect(selectGame().log.get(i++).message).eql(['traitMoveFood', 2, 'TraitCarnivorous', $X, null]);
      expect(selectGame().log.get(i++).message).eql(['traitMoveFood', 1, 'TraitScavenger', $A, $X]);
      expect(selectGame().log.get(i++).message).eql(['traitNotify_Start', $A, 'TraitCommunication', $S1]);
      expect(selectGame().log.get(i++).message).eql(['traitMoveFood', 1, 'TraitCommunication', $S1, $A]);
      expect(selectGame().log.get(i++).message).eql(['gameEndTurn', User2.id, false, false]);
      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User0.id]);
      expect(selectGame().log.get(i++).message).eql(['gameEndTurn', User0.id, true, false]);
      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User1.id]);
      expect(selectGame().log.get(i++).message).eql(['gameEndTurn', User1.id, true, false]);
      expect(selectGame().log.get(i++).message).eql(['gameNextPlayer', User2.id]);
      expect(selectGame().log.get(i++).message).eql(['gameEndTurn', User2.id, true, false]);
      expect(selectGame().log.get(i++).message).eql(['PhaseExtinct']);

      expect(selectGame().log.get(i++).message).eql(['animalDeath', 'STARVE', ['$Animal', 'TraitFatTissue']]);
      expect(selectGame().log.get(i++).message).eql(['animalDeath', 'STARVE', ['$Animal']]);
      expect(selectGame().log.get(i++).message).eql(['animalDeath', 'STARVE', ['$Animal', 'TraitCarnivorous']]);
      expect(selectGame().log.get(i++).message).eql(['animalDeath', 'STARVE', ['$Animal', 'TraitCarnivorous']]);
      expect(selectGame().log.get(i++).message).eql(['animalDeath', 'STARVE', ['$Animal']]);
      expect(selectGame().log.get(i++).message).eql(['animalDeath', 'STARVE', ['$Animal', 'TraitCarnivorous']]);
      expect(selectGame().log.get(i++).message).eql(['animalDeath', 'POISON', $X]);
      expect(selectGame().log.get(i++).message).eql(['animalDeath', 'STARVE', ['$Animal', 'TraitCarnivorous']]);

      expect(selectGame().log.get(i++).message).eql(['PhaseDeploy']);
    };
    checkLog(selectGame);
    checkLog(selectGame0);
  });
});