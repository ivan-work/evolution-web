import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitActivateRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import {TRAIT_ANIMAL_FLAG} from '../../models/game/evolution/constants';

import {makeGameSelectors} from '../../selectors';

describe('TraitPoisonous:', () => {
  it('A > X, B > Y, C > B', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 12 camo
phase: 2
food: 1
players:
  - continent: $A carn graz, $B carn, $C carn
  - continent: $X pois, $Y pois
`);
    const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitPoisonous');
    expect(selectTrait(User1, 1, 0).type).equal('TraitPoisonous');

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$X'));
    expect(selectAnimal(User0, 0).hasFlag(TRAIT_ANIMAL_FLAG.POISONED)).true;
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$Y'));
    expect(selectAnimal(User0, 1).hasFlag(TRAIT_ANIMAL_FLAG.POISONED)).true;
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$C', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 1).hasFlag(TRAIT_ANIMAL_FLAG.POISONED)).not.true;
    expect(selectAnimal(User0, 1).getFoodAndFat()).equal(2);
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(gameEndTurnRequest());

    // DEPLOY 1

    expect(selectGame().status.phase, 'DEPLOY 1').equal(PHASE.DEPLOY);
    expect(selectPlayer(User0).continent).size(1);
    expect(selectPlayer(User1).continent).size(0);
  });
});






















