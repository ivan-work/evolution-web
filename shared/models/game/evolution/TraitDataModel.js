import {Record} from 'immutable';
import * as traitData from './traitData'
import {CARD_TARGET_TYPE} from './constants';

//import {selectGame} from '../../../selectors'

export class TraitDataModel extends Record({
  type: null
  , food: 0
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_SELF
  , targetType: null
  , cooldowns: null
  , multiple: false
  , disableLastRound: false
  , action: null
  , checkAction: null
  , checkTarget: null
}) {
  static new(traitType) {
    if (!(traitType in traitData)) throw Error(`traitData[${traitType}] not found`);
    return new TraitDataModel({
      ...traitData[traitType]
    });
  }

  static checkAction(game, traitData, sourceAnimal) {
    if (traitData.cooldowns && traitData.cooldowns.some(([link, place]) =>
        game.cooldowns.checkFor(link, sourceAnimal.ownerId, sourceAnimal.id))) {
      return false;
    }
    return !traitData.$checkAction || traitData.$checkAction(game, sourceAnimal);
  }
}