import {
  gameEndTurnRequest
  , traitAnswerRequest
  , traitActivateRequest, gameDeployTraitRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';

import {makeGameSelectors} from '../../selectors';
import * as tt from "../../models/game/evolution/traitTypes";

describe('TraitTrematode:', () => {
  it('Cannot be dropped by TailLoss', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A carn wait, $B tail trema$A
`);
    const {selectGame, selectPlayer, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(clientStore0.getState().getIn(['game', 'question', 'id']), 'Defense Question0').not.ok;
    expect(findAnimal('$B').hasTrait(tt.TraitTrematode));
  });

  it('Cannot be dropped by TailLoss2', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food: 4
players:
  - continent: $A carn wait, $B tail fat trema$A
`);
    const {selectGame, selectPlayer, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(traitActivateRequest('$A', 'TraitCarnivorous', '$B'));
    expect(clientStore0.getState().getIn(['game', 'question', 'id']), 'Defense Question0').ok;

    expectUnchanged('Cannot pick trematode', () => {
      clientStore0.dispatch(traitAnswerRequest(tt.TraitTailLoss, tt.TraitTrematode));
    }, serverStore, clientStore0);

    expect(findAnimal('$B').hasTrait(tt.TraitTrematode)).ok;
  });

  it(`Cannot be played on animals of two different players`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}, {clientStore2, User2}] = mockGame(3);
    const gameId = ParseGame(`
phase: deploy
players:
  - hand: CardTrematodeAndFatTissue
    continent: $A
  - continent: $B1, $B2
  - continent: $C
`);
    const {selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectCard(User0, 0).trait1).equal(tt.TraitTrematode);

    expectUnchanged('$B1 and $C belong to different players', () => {
      clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$B1', false, '$C'));
    }, serverStore, clientStore0, clientStore1, clientStore2);

    clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$B1', false, '$B2'));
    expect(findAnimal('$B1').hasTrait(tt.TraitTrematode)).ok;
    expect(findAnimal('$B2').hasTrait(tt.TraitTrematode)).ok;
  });
});