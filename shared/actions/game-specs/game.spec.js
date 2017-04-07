import {Map, List} from 'immutable';

import {GameModel, TEST_DECK_SIZE, TEST_HAND_SIZE} from '../../models/game/GameModel';
import {CardModel} from '../../models/game/CardModel';
import {AnimalModel} from '../../models/game/evolution/AnimalModel';
import {TraitModel} from '../../models/game/evolution/TraitModel';

import {
  SOCKET_DISCONNECT_NOW,
  roomCreateRequest,
  roomJoinRequest,
  gameCreateRequest,
  gameReadyRequest,
  gameDeployAnimalRequest,
  gameDeployTraitRequest,
  gameEndTurnRequest,
  roomEditSettingsRequest
} from '../actions';
import {makeGameSelectors} from '../../selectors';

describe('Game:', function () {
  it('Game start', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
    clientStore0.dispatch(roomCreateRequest());
    clientStore0.dispatch(roomEditSettingsRequest({decks: ['TEST']}));
    const roomId = serverStore.getState().get('rooms').first().id;
    clientStore1.dispatch(roomJoinRequest(roomId));
    clientStore0.dispatch(gameCreateRequest(roomId));

    const ServerGame = () => serverStore.getState().get('games').first();
    const ClientGame0 = () => clientStore0.getState().get('game');
    const ClientGame1 = () => clientStore1.getState().get('game');

    expect(ServerGame().id).not.null;
    expect(clientStore0.getState().getIn(['rooms', roomId, 'gameId'])).equal(ServerGame().id);
    expect(clientStore1.getState().getIn(['rooms', roomId, 'gameId'])).equal(ServerGame().id);

    expect(ServerGame().roomId).equal(roomId);
    expect(ServerGame().players.size).equal(2);

    expect(ClientGame0(), 'clientStore0.get(game)').ok;
    expect(ClientGame0().id, 'clientStore0.get(game).id').ok;

    clientStore0.dispatch(gameReadyRequest());

    expect(ServerGame().players.get(User0.id).ready, 'Game.players.get(User0).ready').true;
    expect(ServerGame().players.get(User1.id).ready, 'Game.players.get(User1).ready').false;

    expect(ServerGame().players.get(User0.id).hand.size).equal(0);
    expect(ServerGame().players.get(User1.id).hand.size).equal(0);

    clientStore1.dispatch(gameReadyRequest());

    expect(ServerGame().players.get(User0.id).ready, 'Game.players.get(0).status 2').true;
    expect(ServerGame().players.get(User1.id).ready, 'Game.players.get(1).status 2').true;
    expect(ServerGame().deck.size).equal(TEST_DECK_SIZE - TEST_HAND_SIZE - TEST_HAND_SIZE);
    expect(ServerGame().players.get(User0.id).hand.size).equal(TEST_HAND_SIZE);
    expect(ServerGame().players.get(User1.id).hand.size).equal(TEST_HAND_SIZE);

    expect(ServerGame().players.get(User0.id).hand.size).equal(TEST_HAND_SIZE);
    expect(ServerGame().players.get(User1.id).hand.size).equal(TEST_HAND_SIZE);

    expect(ClientGame0()).ok;
    expect(ClientGame0().id).equal(ServerGame().id);
    expect(ClientGame0().roomId).equal(roomId);
    expect(ClientGame0().deck.size, 'ClientGame0().deck').equal(TEST_DECK_SIZE - TEST_HAND_SIZE - TEST_HAND_SIZE);
    expect(ClientGame0().getIn(['players']).size).equal(2);
    expect(ClientGame0().getIn(['players', User0.id, 'hand'])).equal(ServerGame().getIn(['players', User0.id, 'hand']));
    expect(ClientGame0().getIn(['players', User1.id, 'hand'])).not.equal(ServerGame().getIn(['players', User1.id, 'hand']));
    expect(ClientGame0().getPlayer()).equal(ServerGame().getIn(['players', User0.id]));

    expect(ClientGame1()).ok;
    expect(ClientGame1().id).equal(ServerGame().id);
    expect(ClientGame1().roomId).equal(roomId);
    expect(ClientGame1().deck.size, 'ClientGame0().deck').equal(TEST_DECK_SIZE - TEST_HAND_SIZE - TEST_HAND_SIZE);
    expect(ClientGame1().getIn(['players']).size).equal(2);
    expect(ClientGame1().getIn(['players', User0.id, 'hand'])).not.equal(ServerGame().getIn(['players', User0.id, 'hand']));
    expect(ClientGame1().getIn(['players', User1.id, 'hand'])).equal(ServerGame().getIn(['players', User1.id, 'hand']));
    expect(ClientGame1().getPlayer()).equal(ServerGame().getIn(['players', User1.id]));
  });

  it('Cant join in started', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}, {clientStore2, User2}] = mockStores(3);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;
    clientStore1.dispatch(roomJoinRequest(roomId));
    clientStore0.dispatch(gameCreateRequest(roomId));

    expectUnchanged(`Can't join started game`, () =>
        clientStore2.dispatch(roomJoinRequest(roomId))
      , serverStore, clientStore0, clientStore2);
  });

  it('Play as deploy', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
players:
  - hand: 6 camo
  - hand: 6 camo
`);

    const User0OriginalHand = ClientGame0().getIn(['players', User0.id, 'hand']);
    const User1OriginalHand = ClientGame1().getIn(['players', User1.id, 'hand']);

    clientStore0.dispatch(gameDeployAnimalRequest(User0OriginalHand.get(0).id, 0));

    expect(ServerGame().getIn(['players', User0.id, 'hand']), 'Server: User0.hand').size(5);
    expect(ServerGame().getIn(['players', User0.id, 'hand', 0]), 'Server: User0.hand.0').equal(User0OriginalHand.get(1));
    expect(ServerGame().getIn(['players', User0.id, 'hand', 1]), 'Server: User0.hand.1').equal(User0OriginalHand.get(2));
    expect(ServerGame().getIn(['players', User0.id, 'continent']).size, 'Server: User0.continent').equal(1);
    expect(ServerGame().getIn(['players', User0.id, 'continent', 0]), 'Server: User0.continent(animal)').instanceof(AnimalModel);

    expect(ClientGame0().getIn(['players', User0.id, 'hand']), 'User0.hand')
      .equal(ServerGame().getIn(['players', User0.id, 'hand']));
    expect(ClientGame0().getIn(['players', User0.id, 'continent']), 'User0.continent')
      .equal(ServerGame().getIn(['players', User0.id, 'continent']));

    expect(ClientGame1().getIn(['players', User0.id, 'hand']).size, 'User1 see User0.hand')
      .equal(TEST_HAND_SIZE - 1);
    expect(ClientGame1().getIn(['players', User0.id, 'hand']), 'User1 see User0.hand')
      .not.equal(ServerGame().getIn(['players', User0.id, 'hand']));
    expect(ClientGame1().getIn(['players', User0.id, 'continent']), 'User1 see User0.continent')
      .equal(ServerGame().getIn(['players', User0.id, 'continent']));

    /*
     * State: 0-0-1
     * User0: Card#1, Card#2, Card#3, ... | Animal#0
     * User1: Card#0, Card#1, Card#2, ... |
     * */

    expect(ServerGame().status.round, 'ServerGame().status.round').equal(0);
    expect(ClientGame0().status.round, 'ClientGame0().status.round').equal(0);
    expect(ClientGame1().status.round, 'ClientGame1().status.round').equal(0);
    expect(ServerGame().status.currentPlayer, 'ServerGame().status.currentPlayer').equal(1);
    expect(ClientGame0().status.currentPlayer, 'ClientGame0().status.currentPlayer').equal(1);
    expect(ClientGame1().status.currentPlayer, 'ClientGame1().status.currentPlayer').equal(1);
    clientStore1.dispatch(gameDeployAnimalRequest(User1OriginalHand.get(1).id, 0));

    /*
     * State: 0-1-0
     * User0: Card#1, Card#2, Card#3, ... | Animal#0
     * User1: Card#0, Card#2, Card#3, ... | Animal#1
     * */

    expect(ServerGame().status.round, 'ServerGame().status.round').equal(1);
    expect(ClientGame0().status.round, 'ClientGame0().status.round').equal(1);
    expect(ClientGame1().status.round, 'ClientGame1().status.round').equal(1);
    expect(ServerGame().status.currentPlayer, 'ServerGame().status.currentPlayer').equal(0);
    expect(ClientGame0().status.currentPlayer, 'ClientGame0().status.currentPlayer').equal(0);
    expect(ClientGame1().status.currentPlayer, 'ClientGame1().status.currentPlayer').equal(0);
    clientStore0.dispatch(gameDeployAnimalRequest(User0OriginalHand.get(2).id, 0));

    /*
     * State: 0-1-1
     * User0: Card#1, Card#3, Card#4, ... | Animal#2, Animal#0
     * User1: Card#0, Card#2, Card#3, ... | Animal#1
     * */

    expect(ServerGame().status.round, 'ServerGame().status.round').equal(1);
    expect(ClientGame0().status.round, 'ClientGame0().status.round').equal(1);
    expect(ClientGame1().status.round, 'ClientGame1().status.round').equal(1);
    expect(ServerGame().status.currentPlayer, 'ServerGame().status.currentPlayer').equal(1);
    expect(ClientGame0().status.currentPlayer, 'ClientGame0().status.currentPlayer').equal(1);
    expect(ClientGame1().status.currentPlayer, 'ClientGame1().status.currentPlayer').equal(1);
    clientStore1.dispatch(gameDeployAnimalRequest(User1OriginalHand.get(0).id, 1));


    /*
     * State: 0-2-0
     * User0: Card#1, Card#3, Card#4, ... | Animal#2, Animal#0
     * User1: Card#2, Card#3, Card#4, ... | Animal#1, Animal#0
     * */

    expect(ClientGame0().status.round, 'ServerGame().status.round').equal(2);
    expect(ClientGame1().status.round, 'ServerGame().status.round').equal(2);
    expect(ServerGame().status.round, 'ServerGame().status.round').equal(2);
    clientStore0.dispatch(gameDeployAnimalRequest(User0OriginalHand.get(4).id, 1));

    /*
     * State: 0-2-1
     * User0: Card#1, Card#3, Card#5, ... | Animal#2, Animal#4, Animal#0
     * User1: Card#2, Card#3, Card#4, ... | Animal#1, Animal#0
     * */

    expect(ServerGame().getIn(['players', User0.id, 'hand']).size, 'Server: User0.hand').equal(3);
    expect(ServerGame().getIn(['players', User0.id, 'hand', 0]), 'Server: User0.hand.0').equal(User0OriginalHand.get(1));
    expect(ServerGame().getIn(['players', User0.id, 'hand', 1]), 'Server: User0.hand.1').equal(User0OriginalHand.get(3));
    expect(ServerGame().getIn(['players', User0.id, 'hand', 2]), 'Server: User0.hand.1').equal(User0OriginalHand.get(5));
    expect(ServerGame().getIn(['players', User0.id, 'continent']).size, 'Server: User0.continent').equal(3);
    expect(ServerGame().getIn(['players', User0.id, 'continent', 0, 'ownerId']), 'Server: User0.continent(animal)').equal(User0.id);
    expect(ServerGame().getIn(['players', User0.id, 'continent', 1, 'ownerId']), 'Server: User0.continent(animal)').equal(User0.id);
    expect(ServerGame().getIn(['players', User0.id, 'continent', 2, 'ownerId']), 'Server: User0.continent(animal)').equal(User0.id);

    expect(ServerGame().getIn(['players', User1.id, 'hand']).size, 'Server: User1.hand').equal(4);
    expect(ServerGame().getIn(['players', User1.id, 'hand', 0]), 'Server: User1.hand.0').equal(User1OriginalHand.get(2));
    expect(ServerGame().getIn(['players', User1.id, 'hand', 1]), 'Server: User1.hand.1').equal(User1OriginalHand.get(3));
    expect(ServerGame().getIn(['players', User1.id, 'continent']).size, 'Server: User1.continent').equal(2);
    expect(ServerGame().getIn(['players', User1.id, 'continent', 0, 'ownerId']), 'Server: User1.continent(animal)').equal(User1.id);
    expect(ServerGame().getIn(['players', User1.id, 'continent', 1, 'ownerId']), 'Server: User1.continent(animal)').equal(User1.id);

    expect(ClientGame0().getIn(['players', User0.id, 'hand']), 'User0.hand')
      .equal(ServerGame().getIn(['players', User0.id, 'hand']));
    expect(ClientGame0().getIn(['players', User0.id, 'continent']), 'User0.continent')
      .equal(ServerGame().getIn(['players', User0.id, 'continent']));

    expect(ClientGame1().getIn(['players', User0.id, 'hand']).size, 'User1 see User0.hand')
      .equal(3);
    expect(ClientGame1().getIn(['players', User0.id, 'hand']), 'User1 see User0.hand')
      .not.equal(ServerGame().getIn(['players', User0.id, 'hand']));
    expect(ClientGame1().getIn(['players', User0.id, 'continent']), 'User1 see User0.continent')
      .equal(ServerGame().getIn(['players', User0.id, 'continent']));
  });

  it('Play as upgrade', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    const gameId = ParseGame(`
players:
  - hand: 1 camo, 1 sharp
    continent: $A
  - hand: 6 camo
    continent: $B
`);
    const {selectGame, selectCard, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$A'));

    expect(ServerGame().getPlayer(User0).hand, 'ServerGame.hand').size(1);
    expect(ServerGame().getPlayer(User0).getIn(['hand', 0, 'type'])).equal('CardSharpVision');
    expect(ClientGame0().getPlayer(User0).hand, 'ClientGame0.hand').size(1);
    expect(ClientGame0().getPlayer(User0).getIn(['hand', 0, 'type'])).equal('CardSharpVision');
    expect(ClientGame1().getPlayer(User0).hand, 'ClientGame1.hand').size(1);
    expect(ClientGame1().getPlayer(User0).getIn(['hand', 0, 'type'])).not.equal('CardSharpVision');

    const traitCamouflage = selectTrait(User0, 0, 0);
    expect(ServerGame().getPlayer(User0).getAnimal(0).getIn(['traits', 0, 'type'])).equal('TraitCamouflage');
    expect(ServerGame().getPlayer(User0).getAnimal(0).getIn(['traits', 0, 'dataModel'])).ok;
    expect(ServerGame().getPlayer(User0).getAnimal(0).getIn(['traits', 0])).equal(traitCamouflage);
    expect(ClientGame0().getPlayer(User0).getAnimal(0).getIn(['traits', 0])).equal(traitCamouflage);
    expect(ClientGame1().getPlayer(User0).getAnimal(0).getIn(['traits', 0])).equal(traitCamouflage);

    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$A'));

    expect(ServerGame().getPlayer(User0).hand).size(0);
    expect(ClientGame0().getPlayer(User0).hand).size(0);
    expect(ClientGame1().getPlayer(User0).hand).size(0);

    const traitSharpVision = selectTrait(User0, 0, 1);
    expect(ServerGame().getPlayer(User0).getAnimal(0).traits).equal(List.of(traitCamouflage, traitSharpVision));
    expect(ClientGame0().getPlayer(User0).getAnimal(0).traits).equal(List.of(traitCamouflage, traitSharpVision));
    expect(ClientGame1().getPlayer(User0).getAnimal(0).traits).equal(List.of(traitCamouflage, traitSharpVision));
  });

  it('Play as skip turn', () => {
    const [{serverStore, ServerGame, ParseGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    ParseGame(`
players:
  - hand: 5 camo
`);

    clientStore0.dispatch(gameDeployAnimalRequest(ClientGame0().getPlayerCard(User0, 0).id));
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameDeployAnimalRequest(ClientGame0().getPlayerCard(User0, 0).id));
    clientStore0.dispatch(gameDeployAnimalRequest(ClientGame0().getPlayerCard(User0, 0).id));

    expect(ServerGame().getIn(['players', User0.id, 'hand']), 'Server: User0.hand').size(2);
  });

  it('Reload', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;
    const ClientGame1 = () => clientStore1.getState().get('game');
    clientStore0.dispatch(roomJoinRequest(roomId));
    clientStore1.dispatch(roomJoinRequest(roomId));
    clientStore0.dispatch(gameCreateRequest(roomId));
    clientStore0.dispatch(gameReadyRequest());
    clientStore1.dispatch(gameReadyRequest());
    const gameId = serverStore.getState().get('games').first().id;

    clientStore1.disconnect();

    clientStore1.connect(serverStore);

    expect(ClientGame1()).ok;
    expect(ClientGame1().id).equal(gameId);
  });

  it('User0, User1 in Game, User0 disconnects, User1 disconnects', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;
    const ClientGame1 = () => clientStore1.getState().get('game');
    clientStore0.dispatch(roomJoinRequest(roomId));
    clientStore1.dispatch(roomJoinRequest(roomId));
    clientStore0.dispatch(gameCreateRequest(roomId));
    clientStore0.dispatch(gameReadyRequest());
    clientStore1.dispatch(gameReadyRequest());
    const gameId = serverStore.getState().get('games').first().id;
    serverStore.clearActions();

    clientStore0.disconnect(SOCKET_DISCONNECT_NOW);
    //console.log(serverStore.getState().getIn(['games', gameId, 'players']).keySeq().toArray())

    clientStore1.disconnect(SOCKET_DISCONNECT_NOW);

    expect(serverStore.getState().get('games')).equal(Map());
  });
});
















