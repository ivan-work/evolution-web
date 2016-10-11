const DECK_POSITION = {left: '100%', top: '40%'};
const PLAYER_POSITION = {left: '10%', bottom: '0'};
const FOOD_POSITION = {left: '50%', top: '50%'};
export const GAME_POSITIONS = {
  0: null
  , 1: {
    deck: DECK_POSITION
    , player: PLAYER_POSITION
    , food: FOOD_POSITION
  }
  , 2: {
    deck: DECK_POSITION
    , player: PLAYER_POSITION
    , food: FOOD_POSITION
    , 0: {top: '0', left: '0'}
  }
  , 3: {
    deck: DECK_POSITION
    , player: PLAYER_POSITION
    , food: FOOD_POSITION
    , 0: {top: `0`, left: `0`, transform: 'scale(.75)'}
    , 1: {top: `0`, left: `${500*.75}px`, transform: 'scale(.75)'}
  }
  , 4: {
    deck: DECK_POSITION
    , player: PLAYER_POSITION
    , food: FOOD_POSITION
    , 0: {top: `0`, left: `0`}
    , 1: {top: `0`, left: `0`}
    , 2: {top: `0`, left: `0`}
  }
};