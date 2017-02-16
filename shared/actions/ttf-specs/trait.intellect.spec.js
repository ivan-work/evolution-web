import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe.only('TraitIntellect:', () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
food: 10
players:
  - continent: $Q carn int graz, $W carn int, $E carn int, $R carn int
  - continent: $A + camo, $S + burr camo, $D + run tail, $F + run tail
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTraitId} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$A'));
    expect(selectPlayer(User1).continent, 'Animal#Q.getFood()').size(3);
    expect(selectAnimal(User0, 0).getFood(), 'Animal#Q.getFood()').equal(2);

    clientStore0.dispatch(gameEndTurnRequest());
  });
});