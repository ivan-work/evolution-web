import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitDefenceAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import {replaceGetRandom} from '../../utils/randomGenerator';

import {makeGameSelectors} from '../../selectors';

describe('Complex traits:', async () => {
  it('Hunt on Mimicry + TailLoss + Running', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 2
players:
  - continent: $A carn, $B carn, $C carn, $D carn, $E
  - continent: $Z tailloss mimicry running fat, $X
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

      clientStore1.dispatch(traitDefenceAnswerRequest(selectQuestionId(), 'TraitTailLoss', 2));

      expect(selectGame().getIn(['cooldowns', 'ANIMAL', '$B'])).size(2);
      expect(selectPlayer(User0).acted).true;
      expect(selectAnimal(User1, 0).id).equal('$Z');
      expect(selectAnimal(User1, 0).traits).size(3);
    });
  });
});