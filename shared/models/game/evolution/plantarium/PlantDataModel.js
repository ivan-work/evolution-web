import {Record} from 'immutable';

import identity from 'lodash/identity'
import * as tt from "../traitTypes";
import * as pt from "./plantTypes";
import * as plantTypeData from "./plantTypeData";
import {CTT_PARAMETER, TRAIT_ANIMAL_FLAG} from "../constants";
import ERRORS from '../../../../actions/errors';
import uuid from "uuid";

/**
 * @class PlantModel
 * @property {string} id - an ID.
 */
export default class PlantDataModel extends Record({
  type: null
  , fruit: false
  , surviveNoFood: false
  , coverSlots: 0
  , startingFood: 0
  , maxFood: 0
  , produceFood: (game, sourcePlant) => sourcePlant.getFood()
  , onNewPlant: identity
}) {
  static new(plantType) {
    if (!(plantType in plantTypeData)) throw Error(`traitData[${plantType}] not found`);
    const plantData = plantTypeData[plantType];
    return new PlantDataModel(plantData);
  }
}