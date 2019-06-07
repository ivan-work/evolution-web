import logger from '../../../shared/utils/logger';

import {makeClientGameSelectors, makeGameSelectors} from '../../selectors'
import {
  traitActivateRequest,
  traitAmbushActivateRequest,
  traitAmbushContinueRequest,
  traitAnswerRequest,
  traitTakeFoodRequest
} from "../trait";
import {gameDeployPlantTraitRequest, gameDeployTraitRequest, gameEndTurnRequest} from "../game";
import * as tt from "../../models/game/evolution/traitTypes";
import {TRAIT_ANIMAL_FLAG} from "../../models/game/evolution/constants";
import {PHASE} from "../../models/game/GameModel";
import {gamePlantAttackRequest, plantTraitActivateRequest} from "../game.plantarium";
import * as ptt from "../../models/game/evolution/plantarium/plantTraitTypes";
import * as pt from "../../models/game/evolution/plantarium/plantTypes";
import {getErrorOfEatingCooldown} from "../trait.checks";

describe.only('[PLANTARIUM] PlantCarnivorous:', function () {
  describe('Deploy:', function () {
    it('Player can deploy parasitic plant', () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: deploy
plants: PlantEphemeral $eph ++\
  , PlantPerennial $per ++
deck: 5 camo
players:
  - hand: 4 ParasiticPlant
`);
      const {selectGame, findPlant} = makeGameSelectors(serverStore.getState, gameId);
      const {selectGame0, selectPlayer0, findPlant0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
      const cardIds = selectPlayer0().hand.map(({id}) => id).toArray();

      expectUnchanged(`Can't deploy ParasiticPlant to animal`, () => {
        clientStore0.dispatch(gameDeployTraitRequest(cardIds[0], '$A'))
      }, serverStore, clientStore0);
      clientStore0.dispatch(gameDeployPlantTraitRequest(cardIds[0], '$eph'));
      expect(selectGame().plants, 'game.plants.size').size(3);
      expect(findPlant('$eph').traits).size(1);
      expect(findPlant('$eph').traits.first().type).equal(ptt.PlantTraitParasiticLink);
      expect(findPlant('$eph').traits.first().linkSource).equal(true);
      const linkedTrait = findPlant('$eph').traits.first().findLinkedTrait(selectGame());
      const parasiticPlant = selectGame().getPlant(linkedTrait.hostAnimalId);
      expect(parasiticPlant).ok;
      expect(parasiticPlant.traits).size(1);
      expect(parasiticPlant.traits.first().type).equal(ptt.PlantTraitParasiticLink);
      expect(parasiticPlant.traits.first().linkSource).equal(false);
    });

    it('Player can deploy parasitic plant', () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantEphemeral $eph ++ parasiticlink$par, para $par
players:
  -continent: wait
`);
      const {selectGame, findPlant} = makeGameSelectors(serverStore.getState, gameId);

      expect(selectGame().plants, 'game.plants.size').size(2);

      expect(findPlant('$eph').traits).size(1);
      expect(findPlant('$eph').traits.first().type).equal(ptt.PlantTraitParasiticLink);
      expect(findPlant('$eph').traits.first().linkSource).equal(true);

      const parasiticPlant = findPlant('$par');

      expect(parasiticPlant).ok;
      expect(parasiticPlant.type).equal(pt.PlantParasite);
      expect(parasiticPlant.traits).size(1);
      expect(parasiticPlant.traits.first().type).equal(ptt.PlantTraitParasiticLink);
      expect(parasiticPlant.traits.first().linkSource).equal(false);
    });
  });

  describe('Feeding:', function () {
    it('Player can activate parasitic plant', () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantEphemeral $eph ++ parasiticlink$par, para $par
players:
  -continent: $A, $B, wait
`);
      const {selectGame, findPlayerByIdx, findPlant} = makeGameSelectors(serverStore.getState, gameId);

      clientStore0.dispatch(plantTraitActivateRequest('$par', ptt.PlantTraitParasiticLink))
      expect(findPlant('$eph').getFood()).equal(1).ok;
      expect(findPlant('$par').getFood()).equal(1).ok;
      expect(getErrorOfEatingCooldown(selectGame(), findPlayerByIdx(0))).ok;
    });
  });
});
