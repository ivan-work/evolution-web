import {
  gameEndTurnRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitMigrationRequest
  , traitSuckerfishRequest
  , makeTurnTimeoutId
  , SOCKET_DISCONNECT_NOW
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';
import * as ERR from '../../errors/ERR';
import {LOCATION} from '../../models/game/evolution/locations';
import ERRORS from '../errors';
import {testShiftTime} from '../../utils/reduxTimeout';

import {makeGameSelectors} from '../../selectors';

describe('TraitMigration:', () => {
  it('Moves animals once per turn instead of food and traits', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food:
  laurasia: 5
  gondwana: 5
players:
  - continent: $A migr, $B migr @gondwana, $C, $W wait
  - continent: $D, $E
settings:
  addon_continents: true
  continentsLocations: true
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitMigrationRequest('$A', LOCATION.GONDWANA));
    expect(findAnimal('$A').location).equal(LOCATION.GONDWANA);
    expect(ClientGame0().locateAnimal('$A').location, 'Client').equal(LOCATION.GONDWANA);
    expect(selectGame().status.currentPlayer).equal(User0.id);

    expectError(`Can't take food after migration`, ERRORS.LOCATION_LOCKED, () => {
      clientStore0.dispatch(traitTakeFoodRequest('$C'));
    });
    expectError(`Can't use traits after migration`, ERRORS.LOCATION_LOCKED, () => {
      clientStore0.dispatch(traitActivateRequest('$W', tt.TraitWaiter));
    });

    clientStore0.dispatch(traitMigrationRequest('$B', LOCATION.LAURASIA));
    expect(findAnimal('$B').location, 'Several animals migrate from different locations').equal(LOCATION.LAURASIA);
    expect(selectGame().status.currentPlayer, 'Nothing else to do').equal(User1.id);

    clientStore1.dispatch(traitTakeFoodRequest('$D'));

    expectError(`Once per turn`, ERRORS.COOLDOWN, () => {
      clientStore0.dispatch(traitMigrationRequest('$A', LOCATION.LAURASIA));
    });
    clientStore0.dispatch(traitTakeFoodRequest('$C'));
    expect(findAnimal('$C').getFood()).equal(1);
  });

  it(`Can't migrate after taking food or using traits in the round`, () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food:
  laurasia: 5
players:
  - continent: $A migr, $C, $H hiber
  - continent: $D
settings:
  addon_continents: true
  continentsLocations: true
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitTakeFoodRequest('$C'));
    expect(selectGame().status.currentPlayer).equal(User0.id);
    expectError(`Food was taken`, ERRORS.COOLDOWN, () => {
      clientStore0.dispatch(traitMigrationRequest('$A', LOCATION.GONDWANA));
    });
    expect(findAnimal('$A').location).equal(LOCATION.LAURASIA);
  });

  it('Ocean and Swimming', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A migr, $O @ocean migr, $S @gondwana migr swim, $T @gondwana migr swim, $R @ocean migr regen
settings:
  addon_continents: true
  continentsLocations: true
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    expectError(`Regular animal can't swim to the Ocean`, ERRORS.LOCATION_OCEAN_NEEDS_SWIMMING, () => {
      clientStore0.dispatch(traitMigrationRequest('$A', LOCATION.OCEAN));
    });

    clientStore0.dispatch(traitMigrationRequest('$O', LOCATION.GONDWANA));
    expect(findAnimal('$O').location).equal(LOCATION.GONDWANA);
    expect(findAnimal('$O').hasTrait(tt.TraitSwimming), 'Swimming is taken from the discard').ok;

    clientStore0.dispatch(traitMigrationRequest('$S', LOCATION.OCEAN));
    expect(findAnimal('$S').location).equal(LOCATION.OCEAN);
    expect(findAnimal('$S').hasTrait(tt.TraitSwimming, true), 'Swimming goes to the discard').undefined;

    expectError(`Swimming animal can't skip the Ocean`, ERRORS.LOCATION_SWIMMING_BETWEEN_CONTINENTS, () => {
      clientStore0.dispatch(traitMigrationRequest('$T', LOCATION.LAURASIA));
    });

    expectError(`Regeneration can't get the third trait`, tt.TraitRegeneration, () => {
      clientStore0.dispatch(traitMigrationRequest('$R', LOCATION.LAURASIA));
    });
  });

  it('Paired traits are discarded when the animals get to different locations', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A migr comm$B trem$C, $B, $C
  - continent: $W wait
settings:
  addon_continents: true
  continentsLocations: true
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    expect(findAnimal('$A').foodSize).equal(2);
    clientStore0.dispatch(traitMigrationRequest('$A', LOCATION.GONDWANA));
    expect(findAnimal('$A').traits.map(t => t.type).toArray()).eql([tt.TraitMigration]);
    expect(findAnimal('$B').traits).size(0);
    expect(findAnimal('$C').traits).size(0);
    expect(findAnimal('$A').foodSize).equal(1);
    expect(findAnimal('$C').foodSize).equal(1);
  });

  it('Flight: animal with 1 or 2 traits migrates between the continents', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $F flight, $G flight camo carn, $H flight swim, $I flight swim, $K @ocean flight
settings:
  addon_continents: true
  continentsLocations: true
  addon_timeToFly: true
`);
    const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitMigrationRequest('$F', LOCATION.GONDWANA));
    expect(findAnimal('$F').location).equal(LOCATION.GONDWANA);

    expectError(`Three traits`, ERRORS.LOCATION_FLIGHT_TOO_MANY_TRAITS, () => {
      clientStore0.dispatch(traitMigrationRequest('$G', LOCATION.GONDWANA));
    });

    clientStore0.dispatch(traitMigrationRequest('$H', LOCATION.GONDWANA));
    expect(findAnimal('$H').location, 'Swimming animal flies over the Ocean').equal(LOCATION.GONDWANA);
    expect(findAnimal('$H').hasTrait(tt.TraitSwimming)).ok;

    expectError(`Flight is for the continents`, ERRORS.LOCATION_FLIGHT_CONTINENTS_ONLY, () => {
      clientStore0.dispatch(traitMigrationRequest('$I', LOCATION.OCEAN));
    });
    expectError(`Flight is for the continents`, ERRORS.LOCATION_FLIGHT_CONTINENTS_ONLY, () => {
      clientStore0.dispatch(traitMigrationRequest('$K', LOCATION.LAURASIA));
    });
  });

  it('Possible migration keeps the feeding phase', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $X +
  - continent: $A migr +, $B migr +
settings:
  addon_continents: true
  continentsLocations: true
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectGame().status.phase).equal(PHASE.FEEDING);
    expect(selectGame().status.currentPlayer, 'User0 has nothing to do').equal(User1.id);

    clientStore1.dispatch(traitMigrationRequest('$A', LOCATION.GONDWANA));
    expect(selectGame().status.currentPlayer, '$B can migrate in this round').equal(User1.id);
    clientStore1.dispatch(gameEndTurnRequest());
    expect(selectGame().status.phase, '$B can migrate in the next round').equal(PHASE.FEEDING);
    expect(selectGame().status.currentPlayer).equal(User1.id);
    clientStore1.dispatch(gameEndTurnRequest());
    expect(selectGame().status.phase, 'Passed').equal(PHASE.DEPLOY);
    expect(findAnimal('$A').location).equal(LOCATION.GONDWANA);
    expect(findAnimal('$B').location).equal(LOCATION.LAURASIA);
  });
});

describe('TraitSuckerfish:', () => {
  it('Own remora follows the migrant', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food:
  laurasia: 3
players:
  - continent: $A migr, $R suck, $X suck @gondwana, $C
  - continent: $W wait
settings:
  addon_continents: true
  continentsLocations: true
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitMigrationRequest('$A', LOCATION.GONDWANA));
    expect(selectGame().locations.migration.deciders.toArray()).eql([User0.id]);
    expect(ClientGame0().locations.migration.deciders.toArray(), 'Client').eql([User0.id]);
    expectError(`Remoras decide`, ERR.GAME_PLAYER_ACT_ON_QUESTION, () => {
      clientStore0.dispatch(gameEndTurnRequest());
    });

    clientStore0.dispatch(traitSuckerfishRequest(['$R']));
    expect(findAnimal('$R').location).equal(LOCATION.GONDWANA);
    expect(findAnimal('$X').location).equal(LOCATION.GONDWANA);
    expect(selectGame().locations.migration).equal(null);
    expect(ClientGame0().locations.migration, 'Client').equal(null);
    expect(selectGame().status.currentPlayer).equal(User1.id);
  });

  it('Owners of the remoras decide clockwise from the migrating player', () => {
    const [{serverStore, ParseGame}
      , {clientStore0, User0}
      , {clientStore1, User1}
      , {clientStore2, User2}] = mockGame(3);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A migr, $B migr, $W0 wait
  - continent: $R1 suck, $R2 suck
  - continent: $R3 suck, $R4 suck @ocean
settings:
  addon_continents: true
  continentsLocations: true
  timeTurn: 100
  timeTraitResponse: 50
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    serverStore.dispatch(testShiftTime(30));
    clientStore0.dispatch(traitMigrationRequest('$A', LOCATION.GONDWANA));
    expect(selectGame().locations.migration.deciders.toArray()).eql([User1.id, User2.id]);
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)], 'Turn timer is paused').undefined;

    expectError(`Not your turn to decide`, ERR.GAME_PLAYER_ACT_ON_QUESTION, () => {
      clientStore2.dispatch(traitSuckerfishRequest(['$R3']));
    });

    clientStore1.dispatch(traitSuckerfishRequest(['$R1']));
    expect(findAnimal('$R1').location).equal(LOCATION.GONDWANA);
    expect(findAnimal('$R2').location).equal(LOCATION.LAURASIA);
    expect(selectGame().locations.migration.deciders.toArray()).eql([User2.id]);

    serverStore.dispatch(testShiftTime(50));
    expect(findAnimal('$R3').location, 'Timeout: remora stays').equal(LOCATION.LAURASIA);
    expect(selectGame().locations.migration).equal(null);
    expect(selectGame().status.currentPlayer).equal(User0.id);
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)].remaining, 'Turn timer is resumed').equal(70);

    clientStore0.dispatch(traitMigrationRequest('$B', LOCATION.GONDWANA));
    expect(selectGame().locations.migration.deciders.toArray(), '$R1 is in Gondwana already').eql([User1.id, User2.id]);
  });

  it('Turn passes after the remoras when the migrating player leaves', () => {
    const [{serverStore, ParseGame}
      , {clientStore0, User0}
      , {clientStore1, User1}
      , {clientStore2, User2}] = mockGame(3);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food:
  laurasia: 3
players:
  - continent: $A migr, $W0 wait
  - continent: $R1 suck, $C1
  - continent: $C2
settings:
  addon_continents: true
  continentsLocations: true
  timeTurn: 100
  timeTraitResponse: 50
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitMigrationRequest('$A', LOCATION.GONDWANA));
    expect(selectGame().locations.migration.deciders.toArray()).eql([User1.id]);

    clientStore0.disconnect(SOCKET_DISCONNECT_NOW);
    expect(selectGame().getPlayer(User0.id).playing).false;
    expect(selectGame().status.currentPlayer, 'Waits for the remoras').equal(User0.id);
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)], 'No turn timer meanwhile').undefined;

    clientStore1.dispatch(traitSuckerfishRequest(['$R1']));
    expect(findAnimal('$R1').location).equal(LOCATION.GONDWANA);
    expect(selectGame().locations.migration).equal(null);
    expect(selectGame().status.currentPlayer).equal(User1.id);
    expect(serverStore.getTimeouts()[makeTurnTimeoutId(gameId)], 'Turn timer of the next player').ok;
  });

  it('Remora follows only from the location of the migrant and by the rules of the locations', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A @ocean migr, $B migr swim, $W0 wait
  - continent: $R1 @ocean suck, $R2 suck
settings:
  addon_continents: true
  continentsLocations: true
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitMigrationRequest('$A', LOCATION.LAURASIA));
    expect(findAnimal('$A').hasTrait(tt.TraitSwimming)).ok;
    expect(selectGame().locations.migration.deciders.toArray()).eql([User1.id]);
    expectError(`$R2 is not in the Ocean`, ERRORS.LOCATION_WRONG, () => {
      clientStore1.dispatch(traitSuckerfishRequest(['$R2']));
    });
    clientStore1.dispatch(traitSuckerfishRequest(['$R1']));
    expect(findAnimal('$R1').location).equal(LOCATION.LAURASIA);
    expect(findAnimal('$R1').hasTrait(tt.TraitSwimming), 'Remora gets Swimming too').ok;

    clientStore0.dispatch(traitMigrationRequest('$B', LOCATION.OCEAN));
    expect(findAnimal('$B').location).equal(LOCATION.OCEAN);
    expect(selectGame().locations.migration.deciders.toArray(), '$R1 has Swimming now').eql([User1.id]);
    expectError(`Regular remora can't follow to the Ocean`, ERRORS.LOCATION_OCEAN_NEEDS_SWIMMING, () => {
      clientStore1.dispatch(traitSuckerfishRequest(['$R2']));
    });
    clientStore1.dispatch(traitSuckerfishRequest(['$R1']));
    expect(findAnimal('$R1').location).equal(LOCATION.OCEAN);
    expect(findAnimal('$R1').hasTrait(tt.TraitSwimming, true), 'Swimming goes to the discard').undefined;
    expect(findAnimal('$R2').location).equal(LOCATION.LAURASIA);
  });

  it('Migrant and the remora that follows it keep their link', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A migr comm$R, $R suck, $C migr coop$S, $S suck
  - continent: $W wait
settings:
  addon_continents: true
  continentsLocations: true
`);
    const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    clientStore0.dispatch(traitMigrationRequest('$A', LOCATION.GONDWANA));
    expect(findAnimal('$A').hasTrait(tt.TraitCommunication), 'Link waits for the decision').ok;
    clientStore0.dispatch(traitSuckerfishRequest(['$R']));
    expect(findAnimal('$A').hasTrait(tt.TraitCommunication)).ok;
    expect(findAnimal('$R').hasTrait(tt.TraitCommunication)).ok;

    clientStore0.dispatch(traitMigrationRequest('$C', LOCATION.GONDWANA));
    expect(selectGame().locations.migration.deciders.toArray()).eql([User0.id]);
    clientStore0.dispatch(traitSuckerfishRequest([]));
    expect(findAnimal('$C').hasTrait(tt.TraitCooperation)).undefined;
    expect(findAnimal('$S').hasTrait(tt.TraitCooperation)).undefined;
  });
});
