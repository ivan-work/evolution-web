const DECK_POSITION = {};
const PLAYER_POSITION = {left: '0px', bottom: '0px'};
const FOOD_POSITION = {position: 'absolute', left: '10px', top: '50%'};
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
  , 5: {
    deck: DECK_POSITION
    , player: PLAYER_POSITION
    , food: FOOD_POSITION
    , 0: {top: `0`, left: `0`}
    , 1: {top: `0`, left: `0`}
    , 2: {top: `0`, left: `0`}
  }
  , 6: {
    deck: DECK_POSITION
    , player: PLAYER_POSITION
    , food: FOOD_POSITION
    , 0: {top: `0`, left: `0`}
    , 1: {top: `0`, left: `0`}
    , 2: {top: `0`, left: `0`}
  }
  , 7: {
    deck: DECK_POSITION
    , player: PLAYER_POSITION
    , food: FOOD_POSITION
    , 0: {top: `0`, left: `0`}
    , 1: {top: `0`, left: `0`}
    , 2: {top: `0`, left: `0`}
  }
  , 8: {
    deck: DECK_POSITION
    , player: PLAYER_POSITION
    , food: FOOD_POSITION
    , 0: {top: `0`, left: `${0*.75}px`, transform: 'scale(.75)'}
    , 1: {top: `0`, left: `${100*.75}px`, transform: 'scale(.75)'}
    , 2: {top: `0`, left: `${200*.75}px`, transform: 'scale(.75)'}
    , 3: {top: `0`, left: `${300*.75}px`, transform: 'scale(.75)'}
    , 4: {top: `0`, left: `${400*.75}px`, transform: 'scale(.75)'}
    , 5: {top: `0`, left: `${500*.75}px`, transform: 'scale(.75)'}
    , 6: {top: `0`, left: `${600*.75}px`, transform: 'scale(.75)'}
  }
};