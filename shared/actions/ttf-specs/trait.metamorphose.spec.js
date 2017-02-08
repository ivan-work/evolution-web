import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitDefenceAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitMetamorphose:', () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: 2
food: 2
players:
  - continent: $A meta comm$B, $B, $C meta carn, $D meta symb$E, $E, $Waiter graz
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTraitId} = makeGameSelectors(serverStore.getState, gameId);

    expect(selectGame().status.round).equal(0);
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitMetamorphose', 'TraitCommunication'));
    expect(selectAnimal(User0, 0).getFood(), 'Animal#A.getFood()').equal(1);
    expect(selectAnimal(User0, 1).getFood(), 'Animal#B.getFood()').equal(0);
    expect(selectAnimal(User0, 2).getFood(), 'Animal#C.getFood()').equal(0);

    clientStore0.dispatch(gameEndTurnRequest());

    expectUnchanged('$C cannot drop carnivorous', () =>
        clientStore0.dispatch(traitActivateRequest('$C', 'TraitMetamorphose', 'TraitCarnivorous'))
      , serverStore, clientStore0);

    expectUnchanged('$D cannot use metamorphose', () => {
      clientStore0.dispatch(traitActivateRequest('$D', 'TraitMetamorphose', 'TraitMetamorphose'))
    }, serverStore, clientStore0);

    clientStore0.dispatch(traitActivateRequest('$C', 'TraitMetamorphose', 'TraitMetamorphose'));
    expect(selectAnimal(User0, 0).getFood(), 'Animal#A.getFood()').equal(1);
    expect(selectAnimal(User0, 1).getFood(), 'Animal#B.getFood()').equal(0);
    expect(selectAnimal(User0, 2).getFood(), 'Animal#C.getFood()').equal(1);
  });

  /**
   * TODO
   * Solution: rewrite canEat to count Eating Blockers.
   * Rewrute checkAction to countEatingBlockers() <= 1
   * Rewrite getTargets to EatingBlocker OR any other
   */
  it.skip('Can drop traits', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 2
players:
  - continent: $Sh meta shell, $Sh1 carn, $Hi meta hiber, $Sy meta symb$Sy1, $Sy1, $SyHiPassive meta hiber symb$SyHi1, $ShHiActive meta shell hiber symb$SyHi2, $SyHi1, $SyHi2, $Waiter graz
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal, selectTraitId} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Hi', 'TraitHibernation'));
    clientStore0.dispatch(traitActivateRequest('$ShHiActive', 'TraitHibernation'));
    clientStore0.dispatch(traitActivateRequest('$Sh1', 'TraitCarnivorous', '$Sh'));
    clientStore0.dispatch(gameEndTurnRequest());

    expectUnchanged('Animal cannot take food', () => {
      clientStore0.dispatch(traitTakeFoodRequest('$Sh'));
      clientStore0.dispatch(traitTakeFoodRequest('$Hi'));
      clientStore0.dispatch(traitTakeFoodRequest('$Sy'));
      clientStore0.dispatch(traitTakeFoodRequest('$SyHiActive'));
      clientStore0.dispatch(traitTakeFoodRequest('$SyHiPassive'));
    }, serverStore, clientStore0);

    expectUnchanged('Metamorphose cannot activate when animal is blocked', () => {
      clientStore0.dispatch(traitActivateRequest('$Sh', 'TraitMetamorphose', 'TraitMetamorphose'));
    }, serverStore, clientStore0);

    expectChanged('Metamorphose can activate when dropping blocking trait', () => {
      clientStore0.dispatch(traitActivateRequest('$Sh', 'TraitMetamorphose', 'TraitShell'));
    }, serverStore, clientStore0);


    //expect(selectAnimal(User0, 0).getFood(), 'Animal#A.getFood()').equal(1);
    //expect(selectAnimal(User0, 1).getFood(), 'Animal#B.getFood()').equal(0);
    //expect(selectAnimal(User0, 2).getFood(), 'Animal#C.getFood()').equal(0);
    //expect(selectAnimal(User0, 3).getFood(), 'Animal#D.getFood()').equal(1);
  });
});