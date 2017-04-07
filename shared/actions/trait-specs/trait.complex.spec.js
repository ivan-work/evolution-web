import {
  gameDeployTraitRequest
  , roomEditSettingsRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitDefenceAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import {replaceGetRandom} from '../../utils/randomGenerator';

import {makeGameSelectors} from '../../selectors';

describe('Complex traits:', () => {
  it('Hunt on Mimicry + TailLoss + Running', async () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);

    const gameId = ParseGame(`
phase: 2
food: 1
players:
  - continent: $A carn graz, $B carn, $C carn, $D carn, $E carn, $F carn
  - continent: $Z tailloss mimicry running fat, $X, $Y
settings:
  timeTraitResponse: 10
`);
    const {selectGame, selectQuestionId, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    replaceGetRandom(() => 1, () => {
      clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$Z'));
    });

    expect(selectGame().getIn(['cooldowns', 'ANIMAL', '$A'])).size(1);
    expect(selectPlayer(User0).acted).true;
    expect(selectAnimal(User1, 0).id).equal('$Z');

    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());

    replaceGetRandom(() => 0, () => {
      clientStore0.dispatch(traitActivateRequest('$B', 'TraitCarnivorous', '$Z'));
      expect(selectGame().question).ok;
      expect(ClientGame0().question).ok;
      expect(ClientGame1().question).ok;
      clientStore1.dispatch(traitDefenceAnswerRequest(selectQuestionId(), 'TraitTailLoss', 2));
      expect(selectGame().question).null;
      expect(ClientGame0().question).null;
      expect(ClientGame1().question).null;
      expect(selectGame().getIn(['cooldowns', 'ANIMAL', '$B'])).size(2);
      expect(selectPlayer(User0).acted).true;
      expect(selectAnimal(User1, 0).id).equal('$Z');
      expect(selectAnimal(User1, 0).traits).size(3);
      expect(selectAnimal(User1, 0).traits.get(0).type).equal('TraitTailLoss');
      expect(selectAnimal(User1, 0).traits.get(1).type).equal('TraitMimicry');
      expect(selectAnimal(User1, 0).traits.get(2).type).equal('TraitFatTissue');
      clientStore0.dispatch(gameEndTurnRequest());
    });

    clientStore0.dispatch(traitActivateRequest('$C', 'TraitCarnivorous', '$Z'));


    await new Promise(resolve => setTimeout(resolve, 12));

    expect(selectAnimal(User1, 0).traits, 'selectAnimal(User1, 0).traits').size(2);
    expect(selectAnimal(User1, 0).traits.get(0).type).equal('TraitTailLoss');
    expect(selectAnimal(User1, 0).traits.get(1).type).equal('TraitMimicry');
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$D', 'TraitCarnivorous', '$Z'));
    expect(selectGame().question).ok;
    expect(ClientGame0().question).ok;
    expect(ClientGame1().question).ok;
    clientStore1.dispatch(traitDefenceAnswerRequest(selectQuestionId(), 'TraitMimicry', '$X'));
    expect(selectGame().question).null;
    expect(ClientGame0().question).null;
    expect(ClientGame1().question).null;
    expect(selectAnimal(User1, 0).traits).size(2);
    expect(selectAnimal(User1, 0).traits.get(0).type).equal('TraitTailLoss');
    expect(selectAnimal(User1, 0).traits.get(1).type).equal('TraitMimicry');
    expect(selectAnimal(User1, 2)).undefined;
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$E', 'TraitCarnivorous', '$Z'));
    clientStore1.dispatch(traitDefenceAnswerRequest(selectQuestionId(), 'TraitTailLoss', 0));
    expect(selectAnimal(User1, 0).traits).size(1);
    expect(selectAnimal(User1, 0).traits.get(0).type).equal('TraitMimicry');
    clientStore0.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(traitActivateRequest('$F', 'TraitCarnivorous', '$Z'));
    expect(selectAnimal(User1, 0).traits).size(1);
    expect(selectAnimal(User1, 0).traits.get(0).type).equal('TraitMimicry');
    expect(selectAnimal(User1, 1)).undefined;
    clientStore0.dispatch(gameEndTurnRequest());
  });
});























