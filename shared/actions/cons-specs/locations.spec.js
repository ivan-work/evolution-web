import {
  gameEndTurnRequest
  , gameDeployAnimalRequest
  , gameDeployTraitRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitAmbushActivateRequest
  , traitMigrationRequest
  , makeTurnTimeoutId
  , roomCreateRequest
  , roomJoinRequest
  , roomEditSettingsRequest
  , roomStartVotingRequest
  , roomStartVoteActionRequest
  , testHackGame
} from '../actions';

import {PHASE} from '../../models/game/GameModel';
import * as tt from '../../models/game/evolution/traitTypes';
import {TraitModel} from '../../models/game/evolution/TraitModel';
import {LOCATION} from '../../models/game/evolution/locations';
import ERRORS from '../errors';
import {replaceGetRandom} from '../../utils/randomGenerator';
import {testShiftTime} from '../../utils/reduxTimeout';

import {makeGameSelectors} from '../../selectors';

const LOCATIONS_SETTINGS = `
settings:
  addon_continents: true
  continentsLocations: true
`;

describe('Continents locations:', () => {
  describe('Room settings:', () => {
    const startGame = (settings) => {
      const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
      clientStore0.dispatch(roomCreateRequest());
      const roomId = serverStore.getState().get('rooms').first().id;
      clientStore1.dispatch(roomJoinRequest(roomId));
      clientStore0.dispatch(roomEditSettingsRequest({
        name: 'Room Test'
        , timeTurn: 60
        , timeTraitResponse: 60
        , maxPlayers: 2
        , ...settings
      }));
      clientStore0.dispatch(roomStartVotingRequest());
      clientStore1.dispatch(roomStartVoteActionRequest(true));
      const gameId = serverStore.getState().get('games').first().id;
      const {selectGame, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);
      return {selectGame, selectPlayer, User0, User1};
    };

    it('Continents without locations are unchanged', () => {
      const {selectGame, selectPlayer, User0, User1} = startGame({addon_continents: true});
      expect(selectGame().locations).equal(null);
      expect(selectPlayer(User0).hand).size(6);
      expect(selectPlayer(User1).hand).size(6);
      // 84 base + 22 continents (short) - 12 cards in hands
      expect(selectGame().deck).size(84 + 22 - 12);
      expect(selectGame().deck.some(card => card.trait1 === tt.TraitMigration)).false;
    });

    it('Locations mode needs the flag and the continents', () => {
      expect(startGame({continentsLocations: true}).selectGame().locations, 'without continents').equal(null);
      expect(startGame({addon_continents: true, continentsLocations: true, addon_plantarium: true})
        .selectGame().locations, 'with plants').equal(null);
    });

    it('Locations mode: full deck of the continents and 10 cards', () => {
      const {selectGame, selectPlayer, User0, User1} = startGame({addon_continents: true, continentsLocations: true});
      expect(selectGame().locations).ok;
      expect(selectGame().settings.continentsLocations).true;
      expect(selectPlayer(User0).hand).size(10);
      expect(selectPlayer(User1).hand).size(10);
      // 84 base + 22 continents (short) + 20 (herding, migration, suckerfish) - 20 cards in hands
      expect(selectGame().deck).size(84 + 22 + 20 - 20);
      const allCards = selectGame().deck
        .concat(selectPlayer(User0).hand)
        .concat(selectPlayer(User1).hand);
      expect(allCards.filter(card => card.trait1 === tt.TraitHerding)).size(8);
      expect(allCards.filter(card => card.trait1 === tt.TraitMigration)).size(8);
      expect(allCards.filter(card => card.trait1 === tt.TraitSuckerfish)).size(4);
    });
  });

  describe('Deploy:', () => {
    it('Animal is deployed to the chosen continent', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: deploy
players:
  - hand: 4 camo
    continent: $A
${LOCATIONS_SETTINGS}
`);
      const {selectGame, selectPlayer, findCard, selectAnimal} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectAnimal(User0, 0).location, 'Seed default').equal(LOCATION.LAURASIA);

      clientStore0.dispatch(gameDeployAnimalRequest(findCard(User0, tt.TraitCamouflage), 0, LOCATION.GONDWANA));
      expect(selectAnimal(User0, 0).location).equal(LOCATION.GONDWANA);
      expect(ClientGame0().getPlayer(User0).continent.first().location, 'Client').equal(LOCATION.GONDWANA);

      expectError(`Can't deploy to the Ocean`, ERRORS.LOCATION_WRONG, () => {
        clientStore0.dispatch(gameDeployAnimalRequest(findCard(User0, tt.TraitCamouflage), 0, LOCATION.OCEAN));
      });
      expect(selectPlayer(User0).continent).size(2);

      clientStore0.dispatch(gameDeployAnimalRequest(findCard(User0, tt.TraitCamouflage), 2));
      expect(selectAnimal(User0, 2).location, 'Default is Laurasia').equal(LOCATION.LAURASIA);
    });

    it('Swimming sends the animal to the Ocean', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
phase: deploy
players:
  - hand: 2 swim, 2 camo
    continent: $A comm$B coop$C, $B, $C @ocean
${LOCATIONS_SETTINGS}
`);
      const {selectGame, selectPlayer, findCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      expect(findAnimal('$A').hasTrait(tt.TraitCommunication)).ok;

      expectError(`Ocean animal can't get Swimming`, ERRORS.LOCATION_ALREADY_IN_OCEAN, () => {
        clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitSwimming), '$C'));
      });

      clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitSwimming), '$A'));
      expect(selectPlayer(User0).hand, 'Card is played').size(3);
      expect(findAnimal('$A').location).equal(LOCATION.OCEAN);
      expect(findAnimal('$A').hasTrait(tt.TraitSwimming, true), 'Swimming goes to the discard').undefined;
      expect(findAnimal('$A').hasTrait(tt.TraitCommunication), 'Link with Laurasia is discarded').undefined;
      expect(findAnimal('$B').hasTrait(tt.TraitCommunication), 'Link with Laurasia is discarded').undefined;
      expect(findAnimal('$A').hasTrait(tt.TraitCooperation), 'Link within the Ocean stays').ok;
      expect(findAnimal('$C').hasTrait(tt.TraitCooperation), 'Link within the Ocean stays').ok;
      expect(ClientGame0().locateAnimal('$A').location, 'Client').equal(LOCATION.OCEAN);
      expect(ClientGame0().locateAnimal('$A').traits, 'Client').size(1);
    });

    // Such a link can't be deployed by the rules, but the engine of master still allows it, so the server state is
    // prepared directly: the link must be discarded as any other one
    it('Paired trait between animals of two players is discarded too', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
phase: deploy
players:
  - hand: swim
    continent: $A
  - continent: $B
${LOCATIONS_SETTINGS}
`);
      const {findCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      serverStore.dispatch(testHackGame(gameId, game => {
        const [traitA, traitB] = TraitModel.LinkBetween(tt.TraitTrematode, game.locateAnimal('$A'), game.locateAnimal('$B'));
        return game
          .updateIn(['players', User0.id, 'continent', '$A'], animal => animal.traitAttach(traitA))
          .updateIn(['players', User1.id, 'continent', '$B'], animal => animal.traitAttach(traitB));
      }));
      expect(findAnimal('$A').foodSize).equal(2);
      expect(findAnimal('$B').foodSize).equal(2);

      clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitSwimming), '$A'));
      expect(findAnimal('$A').location).equal(LOCATION.OCEAN);
      expect(findAnimal('$A').traits).size(0);
      expect(findAnimal('$B').traits).size(0);
      expect(findAnimal('$B').foodSize).equal(1);
    });

    it('Paired traits within one location only', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
      const gameId = ParseGame(`
phase: deploy
players:
  - hand: 2 comm
    continent: $A, $B @gondwana, $C
${LOCATIONS_SETTINGS}
`);
      const {findCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      expectError(`Laurasia - Gondwana`, ERRORS.LOCATION_LINK, () => {
        clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitCommunication), '$A', false, '$B'));
      });
      clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitCommunication), '$A', false, '$C'));
      expect(findAnimal('$A').hasTrait(tt.TraitCommunication)).ok;
      expect(findAnimal('$C').hasTrait(tt.TraitCommunication)).ok;
    });
  });

  describe('Feeding:', () => {
    it('Every location has its own food base', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: deploy
players:
  - continent: $A, $B @ocean aedif, $C @gondwana aedif
  - continent: $D @gondwana
${LOCATIONS_SETTINGS}
`);
      const {selectGame} = makeGameSelectors(serverStore.getState, gameId);
      replaceGetRandom(() => 4, () => {
        clientStore0.dispatch(gameEndTurnRequest());
        clientStore1.dispatch(gameEndTurnRequest());
      });
      expect(selectGame().status.phase).equal(PHASE.FEEDING);
      // 2 players: Laurasia = d6, Gondwana = d6 + 2, Ocean = 3; +2 for every aedificator of the location
      expect(selectGame().locations.food.toJS()).eql({
        [LOCATION.LAURASIA]: 4
        , [LOCATION.GONDWANA]: 4 + 2 + 2
        , [LOCATION.OCEAN]: 3 + 2
      });
      expect(selectGame().food).equal(0);
      expect(ClientGame0().locations.food.toJS(), 'Client').eql(selectGame().locations.food.toJS());
    });

    it('Animals eat from the food base of their location', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0, ClientGame0}] = mockGame(1);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food:
  laurasia: 0
  ocean: 2
players:
  - continent: $A, $B @ocean, $C @ocean
${LOCATIONS_SETTINGS}
`);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      expectError(`Laurasia is empty`, ERRORS.GAME_FOOD, () => {
        clientStore0.dispatch(traitTakeFoodRequest('$A'));
      });
      clientStore0.dispatch(traitTakeFoodRequest('$B'));
      expect(findAnimal('$B').getFood()).equal(1);
      expect(selectGame().getIn(['locations', 'food', LOCATION.OCEAN])).equal(1);
      expect(ClientGame0().getIn(['locations', 'food', LOCATION.OCEAN]), 'Client').equal(1);
    });

    it('In a round player acts in one location only', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food:
  laurasia: 5
  gondwana: 5
players:
  - continent: $A, $H hiber, $B @gondwana hiber, $G @gondwana fat=true
  - continent: $C, $D
${LOCATIONS_SETTINGS}
`);
      const {selectGame, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$A'));
      expect(selectGame().status.currentPlayer, 'Turn continues').equal(User0.id);

      expect(findTrait('$B', tt.TraitHibernation).getErrorOfUse(selectGame(), findAnimal('$B')))
        .equal(ERRORS.LOCATION_LOCKED);
      expectError(`Can't use traits in Gondwana`, ERRORS.LOCATION_LOCKED, () => {
        clientStore0.dispatch(traitActivateRequest('$B', tt.TraitHibernation));
      });
      clientStore0.dispatch(traitActivateRequest('$H', tt.TraitHibernation));
      expect(findAnimal('$H').hasFlag('HIBERNATED')).true;
      expect(selectGame().status.currentPlayer, 'Nothing to do in Laurasia').equal(User1.id);

      clientStore1.dispatch(traitTakeFoodRequest('$C'));
      expect(selectGame().status.currentPlayer).equal(User0.id);

      clientStore0.dispatch(traitActivateRequest('$B', tt.TraitHibernation));
      expect(findAnimal('$B').hasFlag('HIBERNATED'), 'Next round in Gondwana').true;
      expectError(`Now Laurasia is locked`, ERRORS.LOCATION_LOCKED, () => {
        clientStore0.dispatch(traitTakeFoodRequest('$A'));
      });
    });

    it('Predators and pirates act in their location only', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A carn, $P piracy, $W wait
  - continent: $B @gondwana, $C, $D @gondwana carn +, $E carn +
${LOCATIONS_SETTINGS}
`);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      expectError(`Pirate can't reach Gondwana`, ERRORS.LOCATION_WRONG, () => {
        clientStore0.dispatch(traitActivateRequest('$P', tt.TraitPiracy, '$D'));
      });
      clientStore0.dispatch(traitActivateRequest('$P', tt.TraitPiracy, '$E'));
      expect(findAnimal('$P').getFood()).equal(1);

      expectError(`Predator can't reach Gondwana`, ERRORS.TRAIT_ATTACK_UNAVOIDABLE, () => {
        clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$B'));
      });
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'));
      expect(findAnimal('$C')).null;
      expect(findAnimal('$A').getFood()).equal(2);
    });

    it('Scavenger eats in the location of the victim', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A carn, $S1 @ocean scav, $V, $W0 wait
  - continent: $S2 @gondwana scav, $S3 scav
${LOCATIONS_SETTINGS}
`);
      const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$V'));
      expect(findAnimal('$V')).null;
      expect(findAnimal('$S1').getFood(), 'Ocean').equal(0);
      expect(findAnimal('$S2').getFood(), 'Gondwana').equal(0);
      expect(findAnimal('$S3').getFood(), 'Laurasia').equal(1);
    });

    it('Anglerfish defends in its location only', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A carn, $W wait
  - continent: $C, $Q @gondwana angler=true
settings:
  addon_continents: true
  continentsLocations: true
  addon_timeToFly: true
`);
      const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'));
      expect(findAnimal('$C'), `Anglerfish from Gondwana can't help`).null;
      expect(findAnimal('$Q').hasTrait(tt.TraitAnglerfish, true), `Anglerfish from Gondwana is hidden`).ok;
    });

    it('Anglerfish defends in the same location', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A carn, $W wait
  - continent: $C, $Q angler=true
settings:
  addon_continents: true
  continentsLocations: true
  addon_timeToFly: true
`);
      const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$C'));
      expect(findAnimal('$C'), `Anglerfish defends`).ok;
      expect(findAnimal('$A'), `Anglerfish eats`).null;
    });

    it('Ambush from another location is impossible', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food:
  laurasia: 2
players:
  - continent: $F
  - continent: $S @gondwana ambush carn, $W wait
settings:
  addon_continents: true
  continentsLocations: true
  addon_timeToFly: true
  timeTurn: 100
  timeTraitResponse: 100
`);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$F'));
      expect(selectGame().status.phase).equal(PHASE.FEEDING);
      expect(findAnimal('$F').getFood()).equal(1);
    });

    it('Ambush from the same location', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food:
  laurasia: 2
players:
  - continent: $F
  - continent: $S ambush carn
settings:
  addon_continents: true
  continentsLocations: true
  addon_timeToFly: true
  timeTurn: 100
  timeTraitResponse: 100
`);
      const {selectGame} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$F'));
      expect(selectGame().status.phase).equal(PHASE.AMBUSH);
    });

    it('Grazing and Homeothermy use the food base of their location', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food:
  laurasia: 1
  gondwana: 3
  ocean: 3
players:
  - continent: $A @ocean homeo, $G @gondwana grazing, $W @gondwana wait
settings:
  addon_continents: true
  continentsLocations: true
  addon_bonus: true
`);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      const food = () => selectGame().locations.food.toJS();
      clientStore0.dispatch(traitTakeFoodRequest('$A'));
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitHomeothermy));
      expect(findAnimal('$A').getFood()).equal(2);
      expect(food()).eql({[LOCATION.LAURASIA]: 1, [LOCATION.GONDWANA]: 3, [LOCATION.OCEAN]: 1});
      expect(selectGame().status.round, 'Nothing else to do in the Ocean').equal(1);

      clientStore0.dispatch(traitActivateRequest('$G', tt.TraitGrazing));
      expect(food()).eql({[LOCATION.LAURASIA]: 1, [LOCATION.GONDWANA]: 2, [LOCATION.OCEAN]: 1});
    });

    it('Specializations A and B conflict only within a location', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A thermo, $B photo, $C @gondwana thermo, $D @ocean photo
${LOCATIONS_SETTINGS}
`);
      const {selectGame, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
      const errorOf = (animalId, traitType) => findTrait(animalId, traitType).getErrorOfUse(selectGame(), findAnimal(animalId));
      expect(errorOf('$A', tt.TraitThermosynthesis)).equal(ERRORS.TRAIT_ACTION_SPECIFIC);
      expect(errorOf('$B', tt.TraitPhotosynthesis)).equal(ERRORS.TRAIT_ACTION_SPECIFIC);
      expect(errorOf('$C', tt.TraitThermosynthesis)).false;
      expect(errorOf('$D', tt.TraitPhotosynthesis)).false;
      clientStore0.dispatch(traitActivateRequest('$C', tt.TraitThermosynthesis));
      expect(findAnimal('$C').getFood()).equal(1);
    });

    it('Specializations without locations are unchanged', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A thermo, $B photo, $C thermo
settings:
  addon_continents: true
`);
      const {selectGame, findAnimal, findTrait} = makeGameSelectors(serverStore.getState, gameId);
      expect(selectGame().locations).equal(null);
      expect(findAnimal('$A').location).equal(null);
      expect(findTrait('$A', tt.TraitThermosynthesis).getErrorOfUse(selectGame(), findAnimal('$A')))
        .equal(ERRORS.TRAIT_ACTION_SPECIFIC);
      expect(findTrait('$B', tt.TraitPhotosynthesis).getErrorOfUse(selectGame(), findAnimal('$B'))).false;
    });
  });

  describe('Turn end:', () => {
    it('Offspring is placed in the location of the parent', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
food:
  ocean: 1
players:
  - continent: $A @gondwana rstrat +, $V @ocean vivi +
settings:
  addon_continents: true
  continentsLocations: true
  addon_bonus: true
  addon_timeToFly: true
`);
      const {selectGame, selectPlayer, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitTakeFoodRequest('$V'));
      expect(selectGame().status.phase, 'Feeding is over').equal(PHASE.DEPLOY);
      const locations = selectPlayer(User0).continent.toList().map(animal => animal.location).toArray();
      expect(locations, 'r-strategy').eql([
        LOCATION.GONDWANA, LOCATION.GONDWANA, LOCATION.GONDWANA, LOCATION.OCEAN, LOCATION.OCEAN
      ]);
    });

    it('Every animal in the Ocean brings a point', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
phase: feeding
players:
  - continent: $A @ocean +, $B @ocean camo +
  - continent: $C +, $D @gondwana camo +, $E camo +
${LOCATIONS_SETTINGS}
`);
      const {selectGame} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(gameEndTurnRequest());
      expect(selectGame().status.phase).equal(PHASE.FINAL);
      const scores = selectGame().scoreboardFinal.reduce((result, {playerId, scoreNormal}) => ({
        ...result
        , [playerId]: scoreNormal
      }), {});
      expect(scores[User0.id]).equal(3 + 4);
      expect(scores[User1.id]).equal(2 + 3 + 3);
    });

    it('Player without cards and animals gets 10 cards and deploys two of them as animals', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 30 camo
phase: feeding
players:
  - continent: $A
  - continent: $B +
${LOCATIONS_SETTINGS}
`);
      const {selectGame, selectPlayer, findCard} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(gameEndTurnRequest());
      expect(selectGame().status.phase).equal(PHASE.DEPLOY);
      expect(selectPlayer(User0).continent, '$A starved').size(0);
      expect(selectPlayer(User0).hand).size(10);
      expect(selectGame().locations.forcedAnimals.get(User0.id)).equal(2);

      expect(selectGame().status.currentPlayer).equal(User1.id);
      clientStore1.dispatch(gameEndTurnRequest());

      expectError(`Can't deploy a trait`, ERRORS.LOCATION_FORCED_ANIMALS, () => {
        clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitCamouflage), '$B'));
      });
      expectError(`Can't pass`, ERRORS.LOCATION_FORCED_ANIMALS, () => {
        clientStore0.dispatch(gameEndTurnRequest());
      });
      clientStore0.dispatch(gameDeployAnimalRequest(findCard(User0, tt.TraitCamouflage), 0, LOCATION.GONDWANA));
      expect(selectGame().locations.forcedAnimals.get(User0.id)).equal(1);
      expectError(`Still can't pass`, ERRORS.LOCATION_FORCED_ANIMALS, () => {
        clientStore0.dispatch(gameEndTurnRequest());
      });
      clientStore0.dispatch(gameDeployAnimalRequest(findCard(User0, tt.TraitCamouflage), 0, LOCATION.LAURASIA));
      expect(selectGame().locations.forcedAnimals.has(User0.id)).false;
      clientStore0.dispatch(gameDeployTraitRequest(findCard(User0, tt.TraitCamouflage), selectPlayer(User0).continent.first().id));
      expect(selectPlayer(User0).continent).size(2);
      expect(selectPlayer(User0).hand).size(7);
    });

    it('Timed out restart deploys an animal', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 30 camo
phase: feeding
players:
  - continent: $A
  - continent: $B +
settings:
  addon_continents: true
  continentsLocations: true
  timeTurn: 100
`);
      const {selectGame, selectPlayer} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(gameEndTurnRequest());
      expect(selectGame().status.phase).equal(PHASE.DEPLOY);
      clientStore1.dispatch(gameEndTurnRequest());
      expect(selectGame().status.currentPlayer).equal(User0.id);
      serverStore.dispatch(testShiftTime(100));
      expect(selectPlayer(User0).continent).size(1);
      expect(selectPlayer(User0).continent.first().location).equal(LOCATION.LAURASIA);
      expect(selectGame().locations.forcedAnimals.get(User0.id)).equal(1);
      expect(selectGame().status.currentPlayer).equal(User0.id);
    });
  });

  describe('Herding:', () => {
    it('Herd protects when it is not smaller than the predators of the location', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A carn, $B carn @gondwana, $W wait
  - continent: $H herd, $G @gondwana herd, $X @ocean carn
${LOCATIONS_SETTINGS}
`);
      const {selectGame, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      expectError(`1 herd vs 1 predator in Laurasia`, ERRORS.TRAIT_ATTACK_TOO_MUCH_DEFENSES, () => {
        clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$H'));
      });
      expectError(`1 herd vs 1 predator in Gondwana`, ERRORS.TRAIT_ATTACK_TOO_MUCH_DEFENSES, () => {
        clientStore0.dispatch(traitActivateRequest('$B', tt.TraitCarnivorous, '$G'));
      });
    });

    it('Herd is eaten when predators are more numerous', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A carn, $W wait
  - continent: $H herd, $C carn
${LOCATIONS_SETTINGS}
`);
      const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$H'));
      expect(findAnimal('$H')).null;
    });

    it('Herding does nothing without locations', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A carn, $W wait
  - continent: $H herd
settings:
  addon_continents: true
`);
      const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$H'));
      expect(findAnimal('$H')).null;
    });

    it('Intellect ignores Herding', () => {
      const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
      const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A carn int, $W wait
  - continent: $H herd
settings:
  addon_continents: true
  continentsLocations: true
  addon_timeToFly: true
`);
      const {findAnimal} = makeGameSelectors(serverStore.getState, gameId);
      clientStore0.dispatch(traitActivateRequest('$A', tt.TraitCarnivorous, '$H'));
      expect(findAnimal('$H')).null;
    });
  });

  it('Migration is not available without locations', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}] = mockGame(1);
    const gameId = ParseGame(`
deck: 10 camo
phase: feeding
players:
  - continent: $A migr, $W wait
settings:
  addon_continents: true
`);
    expectError(`No locations`, ERRORS.LOCATION_MODE, () => {
      clientStore0.dispatch(traitMigrationRequest('$A', LOCATION.GONDWANA));
    });
  });
});
