export const CARD_TARGET_TYPE = (i => ({
  DROP_AS_ANIMAL: 1 << i++
  , ANIMAL_SELF: 1 << i++
  , ANIMAL_ENEMY: 1 << i++
  , LINK_SELF: 1 << i++
  , LINK_SELF_ONEWAY: 1 << i++
  , LINK_ENEMY: 1 << i++
}))(0);

export const FOOD_SOURCE_TYPE = {
  GAME: 'GAME'
  , ANIMAL: 'ANIMAL'
};

export const TRAIT_TARGET_TYPE = {
  ANIMAL: 'ANIMAL'
};

export const TRAIT_COOLDOWN_PLACE = {
  ANIMAL: 'ANIMAL'
  , PLAYER: 'PLAYER'
  , GAME: 'GAME'
};

export const TRAIT_COOLDOWN_DURATION = {
  ACTIVATION: 'ACTIVATION'
  , ROUND: 'ROUND'
  , TWO_TURNS: 'TWO_ROUNDS'
  , TURN: 'PHASE'
};

export const TRAIT_COOLDOWN_LINK = {
  EATING: 'EATING'
};

//export const TRAIT_COOLDOWN_PLACE = (i => ({
//  ANIMAL: 'ANIMAL'
//  , PLAYER: 'PLAYER'
//  , GAME: 'GAME'
//}))(0);
//
//export const TRAIT_COOLDOWN_DURATION = (i => ({
//  ACTIVATION: 'ACTIVATION'
//  , ROUND: 'ROUND'
//  , TWO_ROUNDS: i++
//  , PHASE: i++
//}))(0);
//
//export const TRAIT_COOLDOWN_LINK = (i => ({
//  EATING: i++
//}))(0);