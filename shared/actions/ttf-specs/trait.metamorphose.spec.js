import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';

describe('TraitMetamorphose:', () => {
  it('Works', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
phase: feeding
food: 2
players:
  - continent: $A meta comm$B, $B, $C meta carn, $D meta symb$E, $E, $Waiter graz
`);
    const {selectGame, selectPlayer, selectCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);

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
   * Problem: When something blocks animal from eating, you still can activate metamorphose to drop that blocking trait
   * f.e.: Animal with Shell active can drop shell or Animal with symbiosis can drop it.
   * Solution: rewrite checkAction: canEat to countEatingBlockers.
   * Rewrute checkAction to countEatingBlockers() <= 1
   * Rewrite getTargets to EatingBlocker OR any other
   */
  it('Can drop traits', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 2
players:
  - continent: $Sh meta shell, $Sh1 carn, $Hi meta hiber, $Sy meta symb$Sy1, $Sy1, $SyHiPassive meta hiber symb$SyHi1, $ShHiActive meta shell hiber symb$SyHi2, $SyHi1, $SyHi2, $Waiter graz
`);
    const {selectGame, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$Hi', 'TraitHibernation'));
    clientStore0.dispatch(traitActivateRequest('$ShHiActive', 'TraitHibernation'));
    clientStore0.dispatch(traitActivateRequest('$Sh1', 'TraitCarnivorous', '$Sh'));
    clientStore0.dispatch(traitAnswerRequest('TraitShell'));
    clientStore0.dispatch(gameEndTurnRequest());

    expectUnchanged('Animal cannot take food', () => {
      clientStore0.dispatch(traitTakeFoodRequest('$Sh'));
      clientStore0.dispatch(traitTakeFoodRequest('$Hi'));
      clientStore0.dispatch(traitTakeFoodRequest('$Sy'));
      clientStore0.dispatch(traitTakeFoodRequest('$SyHiActive'));
      clientStore0.dispatch(traitTakeFoodRequest('$SyHiPassive'));
    }, serverStore, clientStore0);

    expectUnchanged('Metamorphose cannot activate when animal is blocked', () => {
      //console.log(selectAnimal(User0, 1).getEatingBlockers())
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