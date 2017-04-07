import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitMimicryAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import {getRandom} from '../../utils/RandomGenerator';
import {TraitRunning} from '../../models/game/evolution/traitData';

import {makeGameActionHelpers} from '../generic';
import {makeGameSelectors} from '../../selectors';

describe.only('TraitScavenger:', () => {
  it('A > x C+ B > x D+', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0}, {User1, clientStore1}] = mockGame(3);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn, $B carn
  - continent: $, $C scavenger
  - continent: $, $D scavenger
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    const {activateTrait} = makeGameActionHelpers(serverStore.getState, gameId);
  });
});






















