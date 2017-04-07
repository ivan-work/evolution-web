import logger from '~/shared/utils/logger';
import {List, fromJS} from 'immutable';
import {AnimalModel} from '../AnimalModel';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , CARD_TARGET_TYPE
  , CARD_SOURCE
  , TRAIT_ANIMAL_FLAG
} from '../constants';

import {
  server$startFeeding
  , server$traitActivate
  , server$traitStartCooldown
  , server$traitAnimalRemoveTrait
  , server$traitGrazeFood
  , server$traitSetAnimalFlag
  , server$traitSetValue
  , server$traitNotify_End
  , server$game
  , gameDeployAnimalFromDeck
} from '../../../../actions/actions';

import {selectGame} from '../../../../selectors';

import {endHunt, endHuntNoCd, getStaticDefenses, getActiveDefenses, getAffectiveDefenses} from './TraitCarnivorous';
import {TraitCarnivorous} from '../traitTypes';

export const TraitMetamorphose = {
  type: 'TraitMetamorphose'
  , targetType: TRAIT_TARGET_TYPE.TRAIT
  , playerControllable: true
  , cooldowns: fromJS([
    ['TraitMetamorphose', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, sourceAnimal, traitMetamorphose, targetTrait) => (dispatch, getState) => {
    dispatch(server$traitAnimalRemoveTrait(game, sourceAnimal, targetTrait));
    dispatch(server$traitStartCooldown(game.id, traitMetamorphose, sourceAnimal));

    const {animal} = selectGame(getState, game.id).locateAnimal(sourceAnimal.id, sourceAnimal.ownerId);
    dispatch(server$startFeeding(game.id, animal, 1, 'TraitMetamorphose'));
    return true;
  }
  , $checkAction: (game, sourceAnimal) => sourceAnimal.getWantedFood() > 0 && sourceAnimal.getEatingBlockers(game).length <= 1
  , checkTarget: (game, sourceAnimal, targetTrait) => {
    const eatingBlockers = sourceAnimal.getEatingBlockers(game);
    if (eatingBlockers.length === 0)
      return targetTrait.getDataModel().food === 0;
    else // length === 1
      return targetTrait.id === eatingBlockers[0].id;
  }
  , getTargets: (game, sourceAnimal, traitMetamorphose) => {
    const eatingBlockers = sourceAnimal.getEatingBlockers(game);
    if (eatingBlockers.length === 0)
      return sourceAnimal.getTraits().filter(trait => trait.getDataModel().food === 0);
    else // length === 1
      return List(eatingBlockers);
  }
};

export const TraitShell = {
  type: 'TraitShell'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    ['TraitShell', TRAIT_COOLDOWN_PLACE.ANIMAL, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , action: (game, defenceAnimal, defenceTrait, target, attackAnimal, attackTrait) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, defenceTrait, defenceAnimal));
    dispatch(server$traitSetAnimalFlag(game, defenceAnimal, TRAIT_ANIMAL_FLAG.SHELL, true));
    dispatch(endHunt(game, attackAnimal, attackTrait, defenceAnimal));
    return true;
  }
  , onRemove: (game, animal) => {
    dispatch(server$traitSetAnimalFlag(game, animal, TRAIT_ANIMAL_FLAG.SHELL, false));
  }
};

export const TraitTrematode = {
  type: 'TraitTrematode'
  , cardTargetType: CARD_TARGET_TYPE.LINK_ENEMY
  , food: 1
};
export const TraitInkCloud = {
  type: 'TraitInkCloud'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    ['TraitInkCloud', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , action: (game, defenceAnimal, defenceTrait, target, attackAnimal, attackTrait) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, defenceTrait, defenceAnimal));
    dispatch(endHuntNoCd(game.id, attackAnimal, attackTrait, defenceAnimal));
    return true;
  }
};

export const TraitSpecA = {
  type: 'TraitSpecA'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , cooldowns: fromJS([
    ['TraitSpecA', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, animal, trait) => (dispatch, getState) => {
    dispatch(server$traitStartCooldown(game.id, trait, animal));
    dispatch(server$startFeeding(game.id, animal, 1, 'TraitSpecA'));
    return true;
  }
  , $checkAction: (game, animal, traitSpec) => (animal.canEat(game)
  && !game.players.some(player =>
    player.continent.some(animal =>
      animal.traits.some(trait => trait.id !== traitSpec.id && trait.type === traitSpec.type))))
};

export const TraitSpecB = {
  type: 'TraitSpecB'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , cooldowns: fromJS([
    ['TraitSpecB', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: (game, animal, trait) => (dispatch, getState) => {
    dispatch(server$traitStartCooldown(game.id, trait, animal));
    dispatch(server$startFeeding(game.id, animal, 1, 'TraitSpecA'));
    return true;
  }
  , $checkAction: (game, animal, traitSpec) => (animal.canEat(game)
  && !game.players.some(player =>
    player.continent.some(animal =>
      animal.traits.some(trait => trait.id !== traitSpec.id && trait.type === traitSpec.type))))
};

export const TraitFlight = {type: 'TraitFlight'};

export const TraitViviparous = {
  type: 'TraitViviparous'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , food: 1
  , cooldowns: fromJS([
    ['TraitViviparous', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , action: (game, sourceAnimal, trait) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, trait, sourceAnimal));
    const newborn = AnimalModel.new(sourceAnimal.ownerId).set('food', 1);
    dispatch(server$game(game.id, gameDeployAnimalFromDeck(game.id, newborn, sourceAnimal.id)));
  }
  , $checkAction: (game, animal, traitSpec) => animal.isSaturated(game) && game.deck.size > 0
};

export const TraitAmbush = {
  type: 'TraitAmbush'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , transient: true
  , $checkAction: (game, animal, traitSpec) => animal.hasTrait(TraitCarnivorous)
  , action: (game, sourceAnimal, trait) => (dispatch) => {
    dispatch(server$traitSetValue(game, sourceAnimal, trait, !trait.value));
    return false;
  }
};
export const TraitIntellect = {
  type: 'TraitIntellect'
  , food: 1
  , getTargets: (game) => {
    const {animal: sourceAnimal} = game.locateAnimal(game.question.sourceAid);
    const {animal: targetAnimal} = game.locateAnimal(game.question.targetAid);
    return [].concat(
      getStaticDefenses(game, sourceAnimal, targetAnimal)
      , getActiveDefenses(game, sourceAnimal, targetAnimal)
      , getAffectiveDefenses(game, sourceAnimal, targetAnimal));
  }
};
export const TraitAnglerfish = {
  type: 'TraitAnglerfish'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , transient: true
  , hidden: true
  , $checkAction: (game, animal, traitSpec) => animal.traits.size === 1
  , action: (game, sourceAnimal, trait) => (dispatch) => {
    dispatch(server$traitSetValue(game, sourceAnimal, trait, !trait.value));
    return false;
  }
};
