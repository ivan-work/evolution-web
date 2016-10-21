import {Record, List, Map} from 'immutable';
import {TRAIT_COOLDOWN_DURATION, TRAIT_COOLDOWN_PLACE, TRAIT_COOLDOWN_LINK} from './evolution/constants';

export class CooldownList extends Record(
  Object.keys(TRAIT_COOLDOWN_PLACE).reduce((result, key) => {
    result[key] = Map()
    return result;
  }, {})) {

  static new() {
    return new CooldownList()
  }

  static fromServer(js) {
    return new CooldownList({...js})
      .map(place => Map(place)
        .map(placeIds => List(placeIds)
          .map(cooldown => CooldownModel.fromServer(cooldown))))
  }

  startCooldown(link, duration, place, placeId) {

    //
    //return this.update(place, placeIdsMap => placeIdsMap.update(placeId, Map(), cooldowns => placeId.(Map.of(placeId, List(), (cooldowns) =>

    //console.log(this.toJS())
    //console.log(this.updateIn([place, placeId], List(), (cooldowns) => {
    //console.log('cooldowns', cooldowns)
    //  return cooldowns.push(CooldownModel.new(link, duration)) }))
    return this.updateIn([place, placeId], List(), (cooldowns) =>
      cooldowns.push(CooldownModel.new(link, duration)))
  }

  checkFor(link, playerId, animalId) {
    const global = this.getIn([TRAIT_COOLDOWN_PLACE.GAME, 'default'], List()).find(cd => cd.link === link);
    const player = this.getIn([TRAIT_COOLDOWN_PLACE.PLAYER, playerId], List()).find(cd => cd.link === link);
    const animal = this.getIn([TRAIT_COOLDOWN_PLACE.ANIMAL, animalId], List()).find(cd => cd.link === link);
    return !!global || !!player || !!animal;
  }

  updateDuration(durationUpdateFn) {
    return this
      .map(placeType => placeType
        .map(placeIdsList => placeIdsList
          .map(cooldown =>
            cooldown.update('duration', durationUpdateFn)
          )
          .filter(cooldown => cooldown.duration !== null)))
  }

  eventNextAction() {
    return this.updateDuration(duration => {
      switch (duration) {
        case TRAIT_COOLDOWN_DURATION.ACTIVATION:
          return null;
        case TRAIT_COOLDOWN_DURATION.ROUND:
          return duration;
        case TRAIT_COOLDOWN_DURATION.TURN:
          return duration;
        case TRAIT_COOLDOWN_DURATION.TWO_TURNS:
          return duration;
      }
    });
  }

  eventNextPlayer(nextRound) {
    return this.updateDuration(duration => {
      switch (duration) {
        case TRAIT_COOLDOWN_DURATION.ACTIVATION:
          return null;
        case TRAIT_COOLDOWN_DURATION.ROUND:
          return nextRound ? null : duration;
        case TRAIT_COOLDOWN_DURATION.TURN:
          return duration;
        case TRAIT_COOLDOWN_DURATION.TWO_TURNS:
          return duration;
      }
    });
  }

  eventNextTurn() {
    return this.updateDuration(duration => {
      switch (duration) {
        case TRAIT_COOLDOWN_DURATION.ACTIVATION:
          return null;
        case TRAIT_COOLDOWN_DURATION.ROUND:
          return null;
        case TRAIT_COOLDOWN_DURATION.TURN:
          return null;
        case TRAIT_COOLDOWN_DURATION.TWO_TURNS:
          return TRAIT_COOLDOWN_DURATION.TURN;
      }
    });
  }
}

class CooldownModel extends Record({
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