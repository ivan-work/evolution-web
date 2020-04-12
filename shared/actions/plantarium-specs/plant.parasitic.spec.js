import logger from '../../../shared/utils/logger';

import {makeClientGameSelectors, makeGameSelectors} from '../../selectors'
import {
  traitActivateRequest,
  traitAmbushActivateRequest,
  traitAmbushContinueRequest,
  traitAnswerRequest,
  traitTakeFoodRequest
} from "../trait";
import {gameDeployTraitRequest, gameEndTurnRequest} from "../game";
import * as tt from "../../models/game/evolution/traitTypes";
import {TRAIT_ANIMAL_FLAG} from "../../models/game/evolution/constants";
import {PHASE} from "../../models/game/GameModel";
import {gamePlantAttackRequest, plantTraitActivateRequest} from "../game.plantarium";
import * as ptt from "../../models/game/evolution/plantarium/plantTraitTypes";
import * as pt from "../../models/game/evolution/plantarium/plantTypes";
import {getErrorOfEatingCooldown} from "../trait.checks";
import ERRORS from "../errors";

describe('[PLANTARIUM] PlantParasitic:', function () {
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

      // expectUnchanged(`Can't deploy ParasiticPlant to animal`, () => {
      // }, serverStore, clientStore0);
      expectError(`Can't deploy ParasiticPlant to animal`, `No entity found`, () => {
        clientStore0.dispatch(gameDeployTraitRequest(cardIds[0], '$A'))
      });
      clientStore0.dispatch(gameDeployTraitRequest(cardIds[0], '$eph'));
      expect(selectGame().plants, 'game.plants.size').size(3);
      expect(findPlant('$eph').traits).size(1);
      expect(findPlant('$eph').traits.first().type).equal(ptt.PlantTraitParasiticLink);
      expect(findPlant('$eph').traits.first().linkSource).equal(false);
      const linkedTrait = findPlant('$eph').traits.first().findLinkedTrait(selectGame());
      const parasiticPlant = selectGame().getPlant(linkedTrait.hostAnimalId);
      expect(parasiticPlant).ok;
      expect(parasiticPlant.traits).size(1);
      expect(parasiticPlant.traits.first().type).equal(ptt.PlantTraitParasiticLink);
      expect(parasiticPlant.traits.first().linkSource).equal(true);
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

    it('BUG Parasite should die when host is dead', () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: per $HOST, para $PARASITE parasiticlink$HOST myco$MYCOFRIEND, eph $MYCOFRIEND ++
players:
  - continent: $A wait +
`);
      const {selectGame, findPlant} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(gameEndTurnRequest());
      expect(findPlant('$MYCOFRIEND'), '$MYCOFRIEND should live').ok;
      expect(findPlant('$HOST'), '$HOST should die').not.ok;
      expect(findPlant('$PARASITE'), 'parasite should die').not.ok;
    });
  });

  describe('Feeding:', function () {
    it('Player can activate parasitic plant', () => {
      const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);
      const gameId = ParseGame(`
settings:
  addon_plantarium: true
phase: feeding
plants: PlantEphemeral $eph +++, para $par parasiticlink$eph
players:
  - continent: $A, $B, $W wait
`);
      const {selectGame, findPlayerByIndex, findPlant} = makeGameSelectors(serverStore.getState, gameId);

      expect(findPlant('$eph').getTraits().first().linkSource, 'linkSource $eph').false;
      expect(findPlant('$par').getTraits().first().linkSource, 'linkSource $par').true;

      clientStore0.dispatch(plantTraitActivateRequest('$par', ptt.PlantTraitParasiticLink));
      expect(findPlant('$eph').getFood()).equal(2).ok;
      expect(findPlant('$par').getFood()).equal(1).ok;
      expect(selectGame().status.phase).equal(PHASE.FEEDING);
      expect(getErrorOfEatingCooldown(selectGame(), findPlayerByIndex(0).id), 'error of eating cooldown').ok;
      expectError(`cooldown for round 0`, ERRORS.COOLDOWN, () => {
        clientStore0.dispatch(plantTraitActivateRequest('$par', ptt.PlantTraitParasiticLink));
      });

      clientStore0.dispatch(traitActivateRequest('$W', tt.TraitWaiter));
      clientStore0.dispatch(gameEndTurnRequest());

      clientStore0.dispatch(plantTraitActivateRequest('$par', ptt.PlantTraitParasiticLink));
      expect(findPlant('$eph').getFood()).equal(1).ok;
      expect(findPlant('$par').getFood()).equal(2).ok;
      expectError(`cooldown for round 1`, ERRORS.COOLDOWN, () => {
        clientStore0.dispatch(plantTraitActivateRequest('$par', ptt.PlantTraitParasiticLink));
      });

      clientStore0.dispatch(traitActivateRequest('$W', tt.TraitWaiter));
      clientStore0.dispatch(gameEndTurnRequest());

      expectError(`Can't use when 1 food left`, ERRORS.TRAIT_TARGETING_ANIMAL_NO_FOOD, () => {
        clientStore0.dispatch(plantTraitActivateRequest('$par', ptt.PlantTraitParasiticLink));
      });

      expect(findPlant('$eph').getFood()).equal(1).ok;
      expect(findPlant('$par').getFood()).equal(2).ok;
    });
  });
});
