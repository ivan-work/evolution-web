import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitActivateRequest
  , traitTakeFoodRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import {TRAIT_ANIMAL_FLAG} from '../../models/game/evolution/constants';

import {makeGameSelectors} from '../../selectors';

describe('TraitHibernation:', () => {
  it('A > X, B > Y, C > B', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {User1, clientStore1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 21 camo
phase: 2
players:
  - continent: $A hiber fat fat, $B hiber carn, $C hiber
`);
    const {selectGame, selectAnimal, selectPlayer, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User0, 0, 0).type).equal('TraitHibernation');

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitHibernation'));
    expect(selectAnimal(User0, 0).hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED)).true;

    expectUnchanged('Hibernation disables food intake', () => {
      clientStore0.dispatch(traitTakeFoodRequest('$A'));
    }, serverStore, clientStore0, clientStore1);

    clientStore0.dispatch(traitActivateRequest('$C', 'TraitHibernation'));

    clientStore0.dispatch(gameEndTurnRequest());

    // DEPLOY 1
    expect(selectGame().status.turn, 'DEPLOY 1').equal(1);
    expect(selectGame().status.phase, 'DEPLOY 1').equal(PHASE.DEPLOY);
    expect(selectGame().deck.size, 'Deck remaining').equal(12);
    expect(selectPlayer(User0).continent).size(2);
    expect(selectAnimal(User0, 0).id).equal('$A');
    expect(selectAnimal(User0, 1).id).equal('$C');
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectAnimal(User0, 0).hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED), 'Hibernation false after turn').not.true;

    // FEEDING 1
    expect(selectGame().status.turn, 'FEEDING 1').equal(1);
    expect(selectGame().status.phase, 'FEEDING 1').equal(PHASE.FEEDING);
    expectUnchanged('Cooldowns', () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitHibernation'));
      clientStore0.dispatch(traitActivateRequest('$C', 'TraitHibernation'));
    }, serverStore, clientStore0, clientStore1);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(traitTakeFoodRequest('$C'));
    clientStore0.dispatch(gameEndTurnRequest());

    // DEPLOY 2
    expect(selectGame().status.turn, 'DEPLOY 2').equal(2);
    expect(selectGame().status.phase, 'DEPLOY 2').equal(PHASE.DEPLOY);
    expect(selectPlayer(User0).continent).size(2);
    expect(selectGame().deck.size, 'Deck remaining').equal(8);
    expect(selectAnimal(User0, 0).id).equal('$A');
    expect(selectAnimal(User0, 1).id).equal('$C');
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    // FEEDING 2
    expect(selectGame().status.phase, 'FEEDING 2').equal(PHASE.FEEDING);
    expectChanged('Hibernate cooldown wears off', () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitHibernation'));
      clientStore0.dispatch(traitActivateRequest('$C', 'TraitHibernation'));
    }, serverStore, clientStore0, clientStore1);
    clientStore0.dispatch(gameEndTurnRequest());

    // DEPLOY 3
    expect(selectGame().status.phase, 'DEPLOY 3').equal(PHASE.DEPLOY);
    expect(selectPlayer(User0).continent).size(2);
    expect(selectGame().deck.size, 'Deck remaining').equal(4);
    expect(selectAnimal(User0, 0).id).equal('$A');
    expect(selectAnimal(User0, 1).id).equal('$C');
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameEndTurnRequest());

    // FEEDING 3
    expect(selectGame().status.phase, 'FEEDING 3').equal(PHASE.FEEDING);
    expectUnchanged('Hibernate cooldown', () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitHibernation'));
      clientStore0.dispatch(traitActivateRequest('$C', 'TraitHibernation'));
    }, serverStore, clientStore0, clientStore1);
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(traitTakeFoodRequest('$C'));
    clientStore0.dispatch(gameEndTurnRequest());

    // DEPLOY 4
    expect(selectGame().status.phase, 'DEPLOY 4').equal(PHASE.DEPLOY);
    expect(selectPlayer(User0).continent).size(2);
    expect(selectGame().deck.size, 'Deck remaining').equal(0);
    expect(selectAnimal(User0, 0).id).equal('$A');
    expect(selectAnimal(User0, 1).id).equal('$C');
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    // FEEDING 4
    expect(selectGame().status.phase, 'FEEDING 4').equal(PHASE.FEEDING);
    expectUnchanged('Hibernate cooldown wears off', () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitHibernation'));
      clientStore0.dispatch(traitActivateRequest('$C', 'TraitHibernation'));
    }, serverStore, clientStore0, clientStore1);
  });

  it(`Doesnt affect stored fat`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 50 camo
food: 3
phase: 2
players:
  - continent: $A hiber fat fat, $B hiber
`);
    const {selectGame, selectAnimal, selectPlayer, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectTrait(User0, 0, 0).type).equal('TraitHibernation');
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest('$A'));
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectAnimal(User0, 0).getFoodAndFat(), '1: Animal stored food').equal(3);
    expect(selectTrait(User0, 0, 1).value).true;
    expect(selectTrait(User0, 0, 2).value).true;
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.phase, 'DEPLOY 2').equal(PHASE.DEPLOY);
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.phase, 'FEEDING 2').equal(PHASE.FEEDING);
    expect(selectAnimal(User0, 0).getFoodAndFat(), '2: Animal stored food').equal(2);
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitHibernation'));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(selectGame().status.phase, 'DEPLOY 3').equal(PHASE.DEPLOY);
    clientStore0.dispatch(gameEndTurnRequest());
    expect(selectGame().status.phase, 'FEEDING 3').equal(PHASE.FEEDING);
    expect(selectAnimal(User0, 0).getFoodAndFat(), '2: Animal stored food').equal(2);
    expect(selectTrait(User0, 0, 1).value).true;
    expect(selectTrait(User0, 0, 2).value).true;
  });
});






















