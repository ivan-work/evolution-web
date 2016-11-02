import {
  gameDeployTraitRequest
  , gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitMimicryAnswerRequest
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import {RandomGenerator} from '../../utils/RandomGenerator';
import {TraitRunning} from '../../models/game/evolution/traitData';

import {makeGameActionHelpers} from '../generic';
import {makeGameSelectors} from '../../selectors';

describe.only('TraitMimicry:', () => {
  it('$A > $B ($C camo)', () => {
    //sinon.stub(RandomGenerator, 'generate', () => 5);
    RandomGenerator.generate = () => 5;
    console.log(TraitRunning.action());
    console.log(TraitRunning.action());
    console.log(TraitRunning.action());
    console.log(TraitRunning.action());
    console.log(TraitRunning.action());
    console.log(RandomGenerator.generate());
    //RandomGenerator.generate.restore()
    //sinon.stub(RandomGenerator, 'generate', () => 2);
    RandomGenerator.generate = () => 2;
    console.log(TraitRunning.action());
    console.log(TraitRunning.action());
    console.log(TraitRunning.action());
    console.log(TraitRunning.action());
    console.log(TraitRunning.action());
    console.log(RandomGenerator.generate());
    //RandomGenerator.generate.restore()
//    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
//    const gameId = ParseGame(`
//phase: 2
//players:
//  - continent: $A carn
//  - continent: $B mimicry, $C camo
//`);
//    const {selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
//    const {activateTrait} = makeGameActionHelpers(serverStore.getState, gameId);
//    expect(selectTrait(User1, 0, 0).type).equal('TraitMimicry');
//    clientStore0.dispatch(activateTrait(User0, 0, 'TraitCarnivorous', User1, 0));
//    expect(selectAnimal(User0, 0).getFood()).equal(2);
//    expect(selectAnimal(User1, 0).id).equal('$C');
//    expect(selectAnimal(User1, 1)).undefined;
  });
});