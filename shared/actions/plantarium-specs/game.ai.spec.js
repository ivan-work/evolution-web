import logger from '../../../shared/utils/logger';

import {makeGameSelectors} from '../../selectors'
import {gamePlantAttackRequest} from "../game.plantarium";
import {gameEndTurnRequest} from "../game";

describe('[PLANTARIUM] AI:', function () {
  it(`AI works with plant traits`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
deck: 5 camo
deckPlants: fung, 2 eph
plants: pere $host ++++, para $para0 link$host ++, para $para1 link$host +++++, carn $carn
phase: feeding
players:
  - continent: $ +, $ +, $pois pois
`);
    const {selectGame, findPlant, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(gamePlantAttackRequest('$carn', '$pois'))

    expect(selectGame().status.round, 'round 1').equal(1);
    expect(selectPlayer(User0).acted, 'user 0 not acted').equal(false);
  });

  it(`AI works with parasites`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
settings:
  addon_plantarium: true
deck: 5 camo
deckPlants: fung, 2 eph
plants: pere $host ++, para $para0 link$host ++, para $para1 link$host ++
phase: feeding
players:
  - continent: $ +, $ +
`);
    const {selectGame, findPlant, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectPlayer(User0).acted, 'user 0 not acted').equal(false);

    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.turn, 'turn 1').equal(1);
  });
});
