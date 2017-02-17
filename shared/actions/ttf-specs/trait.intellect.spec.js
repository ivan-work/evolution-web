import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import {replaceGetRandom} from '../../utils/randomGenerator';

import {makeGameSelectors} from '../../selectors';

describe.only('TraitIntellect:', () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
food: 10
players:
  - continent: $Q carn int graz, $W carn int, $E carn int, $R carn int, $T carn int
  - continent: $A + camo, $S + burr camo, $D + run tail, $F + run tail, $G + tail
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTraitId} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$A'));
    expect(selectPlayer(User1).continent, 'User1.continent').size(4);
    expect(selectAnimal(User0, 0).getFood(), 'Animal#Q.getFood()').equal(2);

    clientStore0.dispatch(gameEndTurnRequest());

    expectUnchanged('Cant intellect with 2 traits', () => {
      clientStore0.dispatch(traitActivateRequest('$W', 'TraitCarnivorous', '$S'));
    }, serverStore, clientStore0);

    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$E', 'TraitCarnivorous', '$D'));
      expect(selectGame().question, 'Intellect Question').ok;
      expect(clientStore0.getState().getIn(['game', 'question', 'id']), 'Intellect Question0').ok;
      expect(clientStore1.getState().getIn(['game', 'question', 'id']), 'Intellect Question1').null;
      clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitRunning'));
      expect(selectGame().question, 'Defense Question').ok;
      expect(clientStore0.getState().getIn(['game', 'question', 'id']), 'Defense Question0').null;
      expect(clientStore1.getState().getIn(['game', 'question', 'id']), 'Defense Question1').ok;
      clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitRunning'));
    });
    expect(selectPlayer(User1).continent, 'User1.continent').size(4);
    expect(selectAnimal(User0, 2).getFood(), 'Animal#E.getFood()').equal(1);

    clientStore0.dispatch(gameEndTurnRequest());

    replaceGetRandom(() => 0, () => {
      clientStore0.dispatch(traitActivateRequest('$R', 'TraitCarnivorous', '$F'));
      expect(selectGame().question, 'Intellect Question').ok;
      expect(clientStore0.getState().getIn(['game', 'question', 'id']), 'Intellect Question0').ok;
      expect(clientStore1.getState().getIn(['game', 'question', 'id']), 'Intellect Question1').null;
      clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitTailLoss'));
    });
    expect(selectPlayer(User1).continent, 'User1.continent').size(3);
    expect(selectAnimal(User0, 3).getFood(), 'Animal#R.getFood()').equal(2);

    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$T', 'TraitCarnivorous', '$G'));
    expect(selectPlayer(User1).continent, 'User1.continent').size(2);
    expect(selectAnimal(User0, 4).getFood(), 'Animal#T.getFood()').equal(2);
  });
});