import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitTailLoss:', () => {
  it('Simple tail loss', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
food: 10
players:
  - continent: $A carn graz, $B carn
  - continent: $C tailloss carn
`);
    const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitTailLoss');
    expect(selectTrait(User1, 0, 1).type).equal('TraitCarnivorous');

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$C'));

    expectUnchanged(`User1 can't drop trait 2`, () =>
        clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', 'qwe'))
      , serverStore, clientStore0, clientStore1);

    clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitCarnivorous'));

    expectUnchanged(`User0 has cooldown`, () =>
        clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$C'))
      , serverStore, clientStore0, clientStore1);

    expect(selectAnimal(User0, 0).getFoodAndFat(), '$A food').equal(1);
    expect(selectPlayer(User0).acted, 'User0 acted').true;

    expect(selectAnimal(User1, 0)).ok;
    expect(selectAnimal(User1, 0).id).equal('$C');
    expect(selectAnimal(User1, 0).traits).size(1);
    expect(selectTrait(User1, 0, 0).type).equal('TraitTailLoss');

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$C'));

    expect(selectAnimal(User1, 0)).ok;
    expect(selectAnimal(User1, 0).id).equal('$C');
    expect(selectAnimal(User1, 0).traits).size(0);
  });

  it('Tail loss with Symbiosis and Communication', async () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 1
players:
  - continent: $A carn, $B carn, $C carn
  - hand: CardSymb, CardCommu
    continent: $Z tailloss, $X
settings:
  timeTraitResponse: 1
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameDeployTraitRequest(selectCard(User1, 0).id, '$X', false, '$Z'));
    clientStore1.dispatch(gameDeployTraitRequest(selectCard(User1, 0).id, '$X', false, '$Z'));

    expect(selectTrait(User1, 0, 0).type).equal('TraitTailLoss');
    expect(selectTrait(User1, 0, 1).type).equal('TraitSymbiosis');
    expect(selectTrait(User1, 0, 2).type).equal('TraitCommunication');
    expect(selectTrait(User1, 1, 0).type).equal('TraitSymbiosis');
    expect(selectTrait(User1, 1, 1).type).equal('TraitCommunication');

    expect(selectGame().status.phase, 'Feeding').equal(PHASE.FEEDING);

    expectUnchanged(`User0 can't attack $X`, () =>
        clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$X'))
      , serverStore, clientStore0, clientStore1);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$Z'))

    expectUnchanged(`User1 wrong answer`, () =>
        clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', null))
      , serverStore, clientStore0, clientStore1);

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(selectAnimal(User1, 0).traits, '$Z traits').size(2);
    expect(selectAnimal(User1, 1).traits, '$X traits').size(1);
    expect(selectTrait(User1, 0, 0).type).equal('TraitTailLoss');
    expect(selectTrait(User1, 0, 1).type).equal('TraitSymbiosis');
    expect(selectTrait(User1, 1, 0).type).equal('TraitSymbiosis');
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore1.dispatch(gameEndTurnRequest());

    expectUnchanged(`$A can't attack $Z`, () =>
        clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$Z'))
      , serverStore, clientStore0, clientStore1);

    clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$Z'));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(selectAnimal(User1, 0).traits, '$Z traits').size(1);
    expect(selectAnimal(User1, 1).traits, '$X traits').size(0);
    expect(selectTrait(User1, 0, 0).type).equal('TraitTailLoss');
  });
});