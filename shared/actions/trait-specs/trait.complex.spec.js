import logger from '../../utils/logger';
import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
} from '../actions';

import {QuestionRecord} from '../../models/game/GameModel';
import {replaceGetRandom} from '../../utils/randomGenerator';

import {makeClientGameSelectors, makeGameSelectors} from '../../selectors';
import {testShiftTime} from '../../utils/reduxTimeout'
import * as tt from '../../models/game/evolution/traitTypes';

describe('Complex traits:', () => {
  it('Hunt on Mimicry + TailLoss + Running', () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);

    const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A carn graz, $B carn, $C carn, $D carn, $E carn, $F carn, $WW wait
  - continent: $Z tailloss mimicry running fat, $X, $Y, $W wait
settings:
  timeTraitResponse: 100
`);
    const {selectGame, findPlayerByIndex, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, selectPlayer0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const {selectGame1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$Z'));
      clientStore1.dispatch(traitAnswerRequest(tt.TraitRunning));
    });

    expect(selectGame().question).null;
    expect(findAnimal('$Z')).ok;

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(traitActivateRequest('$W', tt.TraitWaiter));
    clientStore1.dispatch(gameEndTurnRequest());
    expect(selectGame().status.round, `Round 1`).equal(1);
    logger.info('ROUND 1');

    expectError('Cooldown on $A', 'COOLDOWN', () => {
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$Z'))
    });

    replaceGetRandom(() => 0, () => {
      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCarnivorous, '$Z'));
      expect(selectGame().question).ok;
      expect(selectGame0().question).ok;
      expect(selectGame1().question).ok;
      clientStore1.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitRunning));
      expect(selectGame().question).null;
      expect(selectGame0().question).null;
      expect(selectGame1().question).null;

      //expect(selectGame().getIn(['cooldowns', 'ANIMAL', '$A'])).size(1);
      //expect(selectGame().getIn(['cooldowns', 'ANIMAL', '$B'])).size(2);
      //expect(selectGame().getIn(['cooldowns', 'PLAYER', User0.id])).size(1);
      expect(findPlayerByIndex(0).acted).true;
      expect(selectPlayer0().acted).true;
      expect(findAnimal('$Z')).ok;
      expect(findAnimal('$Z').traits.map(t => t.type).toArray())
        .eql([tt.TraitTailLoss, tt.TraitMimicry, tt.TraitFatTissue]);
    });

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(traitActivateRequest('$W', tt.TraitWaiter));
    clientStore1.dispatch(gameEndTurnRequest());
    expect(selectGame().status.round, `Round 2`).equal(2);
    logger.info('ROUND 2');

    clientStore0.dispatch(traitActivateRequest('$C', tt.TraitCarnivorous, '$Z'));
    expect(selectGame().question).ok;
    expect(selectGame0().question).ok;
    expect(selectGame1().question).ok;

    serverStore.dispatch(testShiftTime(200));

    //console.log(selectAnimal(User1, 0).traits)

    expect(findAnimal('$Z').traits.map(t => t.type).toArray())
      .eql([tt.TraitTailLoss, tt.TraitMimicry]);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(traitActivateRequest('$W', tt.TraitWaiter));
    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$D', tt.TraitCarnivorous, '$Z'));

    expect(selectGame().question).ok;
    expect(selectGame0().question).ok;
    expect(selectGame1().question).ok;

    clientStore1.dispatch(traitAnswerRequest(tt.TraitMimicry, '$X'));

    expect(selectGame().question).null;
    expect(selectGame0().question).null;
    expect(selectGame1().question).null;

    expect(findAnimal('$Z').traits.map(t => t.type).toArray())
      .eql([tt.TraitTailLoss, tt.TraitMimicry]);
    expect(findAnimal('$X')).null;

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(traitActivateRequest('$W', tt.TraitWaiter));
    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$E', tt.TraitCarnivorous, '$Z'));
    clientStore1.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitTailLoss));
    expect(findAnimal('$Z').traits.map(t => t.type).toArray())
      .eql([tt.TraitMimicry]);

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(traitActivateRequest('$W', tt.TraitWaiter));
    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$F', tt.TraitCarnivorous, '$Z'));
    expect(findAnimal('$Z')).null;
  });

  it('Instant question resolves to complex question: $A attacks $B, gets redirected to $C, question should exist', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);

    const gameId = ParseGame(`
phase: feeding
food: 1
players:
  - continent: $A carn graz, $B mimi, $C tail fat
`);
    const {selectGame} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    expect(clientStore0.getState().getIn(['game', 'question', 'id']), 'Game has question').ok
    expect(selectGame().getIn(['question', 'id']), 'Server game has question').ok
  });

  it('Player should not set "acted" after instant question', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);

    const gameId = ParseGame(`
phase: feeding
food: 1
players:
  - continent: $A carn, $B tail
`);
    const {selectGame, findPlayerByIndex} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
    expect(selectGame().status.round).equal(1);
    expect(findPlayerByIndex(0).acted, 'User0 not acted').false;
  });

  it('Attacker should not act when questioning', () => {
    const [{serverStore, ParseGame}, {clientStore0}, {clientStore1}] = mockGame(2);

    const gameId = ParseGame(`
phase: feeding
food: 5
players:
  - continent: $Q carn graz piracy hiber +
  - continent: $A tail mimi carn graz piracy hiber +
`);
    const {selectGame} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitCarnivorous, '$A'));

    expectUnchanged('split this if you have problems', () => {
      clientStore0.dispatch(gameEndTurnRequest());
      clientStore0.dispatch(traitTakeFoodRequest('$Q'));
      clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitGrazing));
      clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitHibernate));
      clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitPiracy, '$A'));
    }, serverStore, clientStore0, clientStore1);

    expectUnchanged('User1 cannot do anything', () => {
      clientStore1.dispatch(gameEndTurnRequest());
      clientStore1.dispatch(traitTakeFoodRequest('$A'));
      clientStore1.dispatch(traitActivateRequest('$A', tt.TraitGrazing));
      clientStore1.dispatch(traitActivateRequest('$A', tt.TraitHibernate));
      clientStore1.dispatch(traitActivateRequest('$A', tt.TraitPiracy, '$Q'));
    }, serverStore, clientStore0, clientStore1);

    expectChanged('User1 can only answer', () => {
      clientStore1.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitMimicry));
    }, serverStore, clientStore0, clientStore1);
  });

  it('Intellect defense mimicry', () => {
    const [{serverStore, ParseGame}, {clientStore0}] = mockGame(1);

    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $Q comm$A int carn wait, $A tail mimi ink shell, $B tail mimi ink shell, $C tail mimi ink shell
`);
    const {selectGame} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$Q', tt.TraitCarnivorous, '$A'));
    expect(selectGame().question).ok;
    expect(selectGame().question.type).equal(QuestionRecord.INTELLECT);
    clientStore0.dispatch(traitAnswerRequest(tt.TraitIntellect, tt.TraitTailLoss));
    expect(selectGame().question).ok;
    expect(selectGame().question.type).equal(QuestionRecord.DEFENSE);
    expect(selectGame().question.targetAid).equal('$A');
    clientStore0.dispatch(traitAnswerRequest(tt.TraitMimicry, '$B'));
    expect(selectGame().question).ok;
    expect(selectGame().question.type).equal(QuestionRecord.DEFENSE);
    expect(selectGame().question.targetAid).equal('$B');
    clientStore0.dispatch(traitAnswerRequest(tt.TraitMimicry, '$A'));
    expect(selectGame().question).ok;
    expect(selectGame().question.type).equal(QuestionRecord.DEFENSE);
    expect(selectGame().question.targetAid).equal('$A');
    expectUnchanged('Cannot mimicry', () => {
      clientStore0.dispatch(traitAnswerRequest(tt.TraitMimicry, '$B'));
    }, serverStore, clientStore0);
    clientStore0.dispatch(traitAnswerRequest(tt.TraitInkCloud));
  });
});























