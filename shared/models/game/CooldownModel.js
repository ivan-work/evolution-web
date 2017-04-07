import {Record, List} from 'immutable';
import {TRAIT_COOLDOWN_DURATION, TRAIT_COOLDOWN_PLACE, TRAIT_COOLDOWN_LINK} from './evolution/traitData/constants';

export class CooldownsList {
  static new() {
    return List()
  }

  static fromServer(js) {
    return js === null || js.cooldowns === null
      ? List()
      : List(js.cooldowns).map(cooldown => CooldownModel.fromServer(js))
  }

  static getPath(game, place, placeId) {
    switch (place) {
      case TRAIT_COOLDOWN_PLACE.PLAYER:
        return ['players', placeId, 'cooldowns']
      default:
        throw new Error('UNKNOWN PLACE', place)
    }
  }

  static addCooldown(game, link, duration, place, placeId) {
    return game.updateIn(CooldownsList.getPath(game, place, placeId), (cooldowns) =>
      cooldowns.push(CooldownModel.new(link, duration)))
  }

  static checkFor(game, link, place, placeId) {
    return game.getIn(CooldownsList.getPath(game, place, placeId)).find(cd => cd.link === link) === void 0;
  }
}

export class CooldownModel extends Record({
  link: null
  , duration: null
}) {
  static new(link, duration) {
    return new CooldownModel({link, duration})
  }

  static fromServer(js) {
    return js === List()
      ? null
      : new CooldownModel(js)
  }
}