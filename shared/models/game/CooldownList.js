import {Record, List, Map} from 'immutable';
import {TRAIT_COOLDOWN_DURATION, TRAIT_COOLDOWN_PLACE, TRAIT_COOLDOWN_LINK} from './evolution/constants';

export class CooldownList extends Record(
  Object.keys(TRAIT_COOLDOWN_PLACE).reduce((result, key) => ({...result, [key]: Map()}), {})
) {

  static new() {
    return new CooldownList()
  }

  static fromServer(js) {
    return new CooldownList({...js})
      .map(place => Map(place)
        .map(placeIds => Map(placeIds)));
  }

  startCooldown(link, duration, place, placeId) {
    return this.setIn([place, placeId, link], duration);
  }

  clearCooldown(link, place, placeId) {
    return this.removeIn([place, placeId, link]);
  }

  checkFor(link, playerId, animalId, traitId) {
    const global = this.getIn([TRAIT_COOLDOWN_PLACE.GAME, 'default', link]);
    const player = this.getIn([TRAIT_COOLDOWN_PLACE.PLAYER, playerId, link]);
    const animal = this.getIn([TRAIT_COOLDOWN_PLACE.ANIMAL, animalId, link]);
    const plant = this.getIn([TRAIT_COOLDOWN_PLACE.PLANT, animalId, link]);
    const trait = this.getIn([TRAIT_COOLDOWN_PLACE.TRAIT, traitId, link]);
    return !!global || !!player || !!animal || !!plant || !!trait;
  }

  updateDuration(durationUpdateFn) {
    return this
      .map(placeType => placeType
        .map(placeIdsList => placeIdsList
          .map(durationUpdateFn)
          .filter(duration => duration !== null)))
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

  eventNextPlayer() {
    return this.updateDuration(duration => {
      switch (duration) {
        case TRAIT_COOLDOWN_DURATION.ACTIVATION:
          return null;
        case TRAIT_COOLDOWN_DURATION.ROUND:
          return null;
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