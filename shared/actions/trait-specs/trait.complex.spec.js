import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAnswerRequest
} from '../actions';

import {PHASE, QuestionRecord} from '../../models/game/GameModel';
import {replaceGetRandom} from '../../utils/randomGenerator';

import {makeGameSelectors} from '../../selectors';

describe('Complex traits:', () => {
  it('Hunt on Mimicry + TailLoss + Running', async () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);

    const gameId = ParseGame(`
phase: 2
food: 10
players:
  - continent: $A carn graz, $B carn, $C carn, $D carn, $E carn, $F carn
  - continent: $Z tailloss mimicry running fat, $X, $Y
settings:
  timeTraitResponse: 10
`);
    const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$Z'));
    });

    //expect(selectGame().getIn(['cooldowns', 'ANIMAL', '$A'])).size(1);
    expect(selectAnimal(User1, 0).id).equal('$Z');

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    replaceGetRandom(() => 0, () => {
      expectUnchanged('Cooldown on $A', () =>
          clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$Z'))
        , serverStore, clientStore0, clientStore1);
      clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$Z'));
      expect(selectGame().question).ok;
      expect(ClientGame0().question).ok;
      expect(ClientGame1().question).ok;
      clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitRunning'));
      expect(selectGame().question).null;
      expect(ClientGame0().question).null;
      expect(ClientGame1().question).null;

      //expect(selectGame().getIn(['cooldowns', 'ANIMAL', '$A'])).size(1);
      //expect(selectGame().getIn(['cooldowns', 'ANIMAL', '$B'])).size(2);
      //expect(selectGame().getIn(['cooldowns', 'PLAYER', User0.id])).size(1);
      expect(selectPlayer(User0).acted).true;
      expect(selectAnimal(User1, 0).id).equal('$Z');
      expect(selectAnimal(User1, 0).traits.map(t => t.type).toArray())
        .eql(['TraitTailLoss', 'TraitMimicry', 'TraitFatTissue']);
      clientStore0.dispatch(gameEndTurnRequest());
    });
    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$C', 'TraitCarnivorous', '$Z'));
    expect(selectGame().question).ok;
    expect(ClientGame0().question).ok;
    expect(ClientGame1().question).ok;

    await new Promise(resolve => setTimeout(resolve, 12));

    //console.log(selectAnimal(User1, 0).traits)

    expect(selectAnimal(User1, 0).traits.map(t => t.type).toArray())
      .eql(['TraitTailLoss', 'TraitMimicry']);
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$D', 'TraitCarnivorous', '$Z'));
    expect(selectGame().question).ok;
    expect(ClientGame0().question).ok;
    expect(ClientGame1().question).ok;
    clientStore1.dispatch(traitAnswerRequest('TraitMimicry', '$X'));
    expect(selectGame().question).null;
    expect(ClientGame0().question).null;
    expect(ClientGame1().question).null;
    expect(selectAnimal(User1, 0).traits.map(t => t.type).toArray())
      .eql(['TraitTailLoss', 'TraitMimicry']);
    expect(selectAnimal(User1, 2)).undefined;
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$E', 'TraitCarnivorous', '$Z'));
    clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', 'TraitTailLoss'));
    expect(selectAnimal(User1, 0).traits.map(t => t.type).toArray())
      .eql(['TraitMimicry']);
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$F', 'TraitCarnivorous', '$Z'));
    expect(selectAnimal(User1, 0).traits.map(t => t.type).toArray())
      .eql(['TraitMimicry']);
    expect(selectAnimal(User1, 1)).undefined;
    clientStore0.dispatch(gameEndTurnRequest());
  });

  it('Instant question resolves to complex question: $A attacks $B, gets redirected to $C, question should exist', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);

    const gameId = ParseGame(`
phase: 2
food: 1
players:
  - continent: $A carn graz, $B mimi, $C tail fat
`);
    const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(clientStore0.getState().getIn(['game', 'question', 'id']), 'Game has question').ok
    expect(selectGame().getIn(['question', 'id']), 'Server game has question').ok
  });

  it('Player should not set "acted" after instant question', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);

    const gameId = ParseGame(`
phase: 2
food: 1
players:
  - continent: $A carn, $B tail
`);
    const {selectGame, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(selectGame().status.round).equal(1);
    expect(selectPlayer(User0).acted, 'User0 not acted').false;
  });

  it('Attacker should not act when questioning', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);

    const gameId = ParseGame(`
phase: 2
food: 5
players:
  - continent: $Q carn graz piracy hiber +
  - continent: $A tail mimi carn graz piracy hiber +
`);
    const {selectGame, selectPlayer, selectAnimal, selectTraitId} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$A'));

    expectUnchanged('split this if you have problems', () => {
      clientStore0.dispatch(gameEndTurnRequest());
      clientStore0.dispatch(traitTakeFoodRequest('$Q'));
      clientStore0.dispatch(traitActivateRequest('$Q', 'TraitGrazing'));
      clientStore0.dispatch(traitActivateRequest('$Q', 'TraitHibernate'));
      clientStore0.dispatch(traitActivateRequest('$Q', 'TraitPiracy', '$A'));
    }, serverStore, clientStore0, clientStore1);

    expectUnchanged('User1 cannot do anything', () => {
      clientStore1.dispatch(gameEndTurnRequest());
      clientStore1.dispatch(traitTakeFoodRequest('$A'));
      clientStore1.dispatch(traitActivateRequest('$A', 'TraitGrazing'));
      clientStore1.dispatch(traitActivateRequest('$A', 'TraitHibernate'));
      clientStore1.dispatch(traitActivateRequest('$A', 'TraitPiracy', '$Q'));
    }, serverStore, clientStore0, clientStore1);

    expectChanged('User1 can only answer', () => {
      clientStore1.dispatch(traitAnswerRequest('TraitTailLoss', selectTraitId(User1, 0, 1)));
    }, serverStore, clientStore0, clientStore1);
  });

  it('Intellect defence mimicry', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);

    const gameId = ParseGame(`
deck: 10 camo
phase: 2
food: 4
players:
  - continent: $Q comm$A int carn wait, $A tail mimi ink shell, $B tail mimi ink shell, $C tail mimi ink shell
`);
    const {selectGame, selectPlayer, selectAnimal, selectTraitId} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitActivateRequest('$Q', 'TraitCarnivorous', '$A'));
    expect(selectGame().question).ok;
    expect(selectGame().question.type).equal(QuestionRecord.INTELLECT);
    clientStore0.dispatch(traitAnswerRequest('TraitIntellect', 'TraitTailLoss'));
    expect(selectGame().question).ok;
    expect(selectGame().question.type).equal(QuestionRecord.DEFENSE);
    expect(selectGame().question.targetAid).equal('$A');
    clientStore0.dispatch(traitAnswerRequest('TraitMimicry', '$B'));
    expect(selectGame().question).ok;
    expect(selectGame().question.type).equal(QuestionRecord.DEFENSE);
    expect(selectGame().question.targetAid).equal('$B');
    clientStore0.dispatch(traitAnswerRequest('TraitMimicry', '$A'));
    expect(selectGame().question).ok;
    expect(selectGame().question.type).equal(QuestionRecord.DEFENSE);
    expect(selectGame().question.targetAid).equal('$A');
    expectUnchanged('Cannot mimicry', () => {
      clientStore0.dispatch(traitAnswerRequest('TraitMimicry', '$B'));
    }, serverStore, clientStore0);
    clientStore0.dispatch(traitAnswerRequest('TraitInkCloud'));
  });
});























