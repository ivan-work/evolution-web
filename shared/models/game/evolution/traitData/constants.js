export const TRAIT_TARGET_TYPE = (i => ({
  ANIMAL: 1 << i++
}))(0);

export const TRAIT_COOLDOWN_PLACE = (i => ({
  ANIMAL: i++
  , PLAYER: i++
  , GAME: i++
}))(0);

export const TRAIT_COOLDOWN_DURATION = (i => ({
  ACTIVATION: i++ //stored at animal
  , ROUND: i++
  , TWO_ROUNDS: i++
  , PHASE: i++
}))(0);

export const TRAIT_COOLDOWN_LINK = (i => ({
  EATING: i++
}))(0);