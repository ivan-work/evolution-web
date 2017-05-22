import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
  , gameDeployTraitRequest
  , gameDeployRegeneratedAnimalRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import {TRAIT_ANIMAL_FLAG} from '../../models/game/evolution/constants';
import {replaceGetRandom} from '../../utils/randomGenerator';
import * as tt from '../../models/game/evolution/traitTypes';

import {makeGameSelectors} from '../../selectors';

describe('TraitCnidocytes:', () => {
  it('Works with running and ink', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn, $B carn, $C run ink cnid wait
`);

    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'));
      expect(findAnimal('$A').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).true;
    });
    clientStore0.dispatch(gameEndTurnRequest());
    replaceGetRandom(() => 0, () => {
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCarnivorous, '$C'));
      clientStore0.dispatch(traitAnswerRequest(tt.TraitInkCloud));
      expect(findAnimal('$B').hasFlag(TRAIT_ANIMAL_FLAG.PARALYSED)).true;
    });
  });
});