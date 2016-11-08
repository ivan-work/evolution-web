import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitDefenceAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitMimicry:', () => {
  it('$A > $B ($C camo)', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C camo
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$C');
    expect(selectAnimal(User1, 1)).undefined;
  });

  it('$A > $B m> $C', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$B');
    expect(selectAnimal(User1, 1)).undefined;
  });

  it('$A > $B m> $C m> $B', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C mimicry
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$C');
    expect(selectAnimal(User1, 1)).undefined;
  });

  it('$A > $B > $C ($D)', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C, $D
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    clientStore1.dispatch(traitDefenceAnswerRequest({
      sourcePid: selectAnimal(User0, 0).ownerId
      , sourceAid: selectAnimal(User0, 0).id
      , traitType: 'TraitCarnivorous'
      , targetPid: selectAnimal(User1, 0).ownerId
      , targetAid: selectAnimal(User1, 0).id
    }, {
      traitType: 'TraitMimicry'
      , targetPid: selectAnimal(User1, 1).ownerId
      , targetAid: selectAnimal(User1, 1).id
    }));
    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$B');
    expect(selectAnimal(User1, 1).id).equal('$D');
    expect(selectAnimal(User1, 2)).undefined;
  });

  it('$A > $B m> $C m> $B', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C mimicry, $D
`);
    const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));

    clientStore1.dispatch(traitDefenceAnswerRequest({
      sourcePid: User0.id
      , sourceAid: '$A'
      , traitType: 'TraitCarnivorous'
      , targetPid: User1.id
      , targetAid: '$B'
    }, {
      traitType: 'TraitMimicry'
      , targetPid: User1.id
      , targetAid: '$C'
    }));

    clientStore1.dispatch(traitDefenceAnswerRequest({
      sourcePid: User0.id
      , sourceAid: '$A'
      , traitType: 'TraitCarnivorous'
      , targetPid: User1.id
      , targetAid: '$C'
    }, {
      traitType: 'TraitMimicry'
      , targetPid: User1.id
      , targetAid: '$B'
    }));

    expect(selectAnimal(User0, 0).getFood()).equal(2);
    expect(selectAnimal(User1, 0).id).equal('$C');
    expect(selectAnimal(User1, 1).id).equal('$D');
    expect(selectAnimal(User1, 2)).undefined;
  });

  it('$A > $B (auto)> $C ($D)', async () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn
  - continent: $B mimicry, $C, $D
`);
    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));

    expect(selectAnimal(User0, 0).getFood()).equal(0);
    expect(selectAnimal(User1, 0).id).equal('$B');
    expect(selectAnimal(User1, 1).id).equal('$C');
    expect(selectAnimal(User1, 2).id).equal('$D');

    await new Promise(resolve => setTimeout(resolve, 1));

    expect(selectAnimal(User0, 0).getFood(), '').equal(2);
    expect(selectAnimal(User1, 0).id).equal('$B');
    expect(selectAnimal(User1, 1).id).equal('$D');
    expect(selectAnimal(User1, 2)).undefined;
  });
});