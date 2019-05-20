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
phase: feeding
food: 0
players:
  - continent: $A carn, $B carn, $C carn, $W wait +
  - continent: $X pois, $Y pois
`);
    const {selectGame, selectPlayer, selectAnimal, findAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$X'));
    expect(findAnimal('$A').hasFlag(TRAIT_ANIMAL_FLAG.POISONED), '$A is poisoned').true;
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$Y'));
    expect(findAnimal('$B').hasFlag(TRAIT_ANIMAL_FLAG.POISONED), '$B is poisoned').true;
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$C', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 1).hasFlag(TRAIT_ANIMAL_FLAG.POISONED)).not.true;
    expect(selectAnimal(User0, 1).getFoodAndFat()).equal(2);
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    // DEPLOY 1

    expect(selectGame().status.phase, 'DEPLOY 1').equal(PHASE.DEPLOY);
    expect(selectPlayer(User0).continent).size(2);
    expect(selectPlayer(User1).continent).size(0);
  });

  it('When not fed animal starves and poisons', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 12 camo
phase: feeding
food: 0
players:
  - continent: $A pois, $B carn mass, $C carn mass, $D pois
`);
    const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$A'));
    clientStore0.dispatch(traitActivateRequest('$C', 'TraitCarnivorous', '$D'));
    expect(selectGame().status.turn, 'Turn 1').equal(1);
    expect(selectPlayer(User0).continent, 'Everybody dead').size(0);
  });
});






















