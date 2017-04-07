import {Record} from 'immutable';
import * as traitData from './traitData'

export class TraitDataModel extends Record({
  type: null
  , food: 0
  , targetType: null
  , cooldowns: null
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
}