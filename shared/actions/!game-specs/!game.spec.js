import {Map, List} from 'immutable';

import {GameModel, TEST_DECK_SIZE, TEST_HAND_SIZE} from '../../models/game/GameModel';
import {CardModel} from '../../models/game/CardModel';
import {AnimalModel} from '../../models/game/evolution/AnimalModel';
import {TraitModel} from '../../models/game/evolution/TraitModel';

import {
  SOCKET_DISCONNECT_NOW,
  roomCreateRequest,
  roomJoinRequest,
  roomStartVotingRequest,
  roomStartVoteActionRequest,
  gameDeployAnimalRequest,
  gameDeployTraitRequest,
  gameEndTurnRequest
} from '../actions';
import {makeGameSelectors, makeClientGameSelectors} from '../../selectors';

describe('Game:', function () {
  it('Game start', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;
    clientStore1.dispatch(roomJoinRequest(roomId));
    clientStore0.dispatch(roomStartVotingRequest());
    clientStore1.dispatch(roomStartVoteActionRequest(true));

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
    expect(ClientGame0().getIn(['players', User0.id, 'hand']).toJS()).eql(ServerGame().getIn(['players', User0.id, 'hand']).toJS())
    expect(ClientGame0().getIn(['players', User0.id, 'hand']), 'User0 hands equals with Server').equal(ServerGame().getIn(['players', User0.id, 'hand']));
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
    clientStore0.dispatch(roomStartVotingRequest());
    clientStore1.dispatch(roomStartVoteActionRequest(true));

    expectUnchanged(`Can't join started game`, () =>
        clientStore2.dispatch(roomJoinRequest(roomId))
      , serverStore, clientStore0, clientStore2);
  });

  it('Play as deploy', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
players:
  - hand: 6 camo
  - hand: 6 camo
`);
    const {selectGame, selectPlayer, selectCard, findAnimal} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, selectPlayer0, selectCard0, findAnimal0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const {selectGame1, selectPlayer1, selectCard1, findAnimal1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

    const User0OriginalHand = selectGame0().getIn(['players', User0.id, 'hand']);
    const User1OriginalHand = selectGame1().getIn(['players', User1.id, 'hand']);

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id, 0));

    expect(selectPlayer(User0).hand, 'Server: User0.hand').size(5);
    expect(selectPlayer(User0).hand.get(0), 'Server: User0.hand.0').equal(User0OriginalHand.get(1));
    expect(selectPlayer(User0).hand.get(1), 'Server: User0.hand.1').equal(User0OriginalHand.get(2));
    expect(selectPlayer(User0).continent, 'Server: User0.continent').size(1);
    expect(selectPlayer(User0).continent.first(), 'Server: User0.continent').instanceof(AnimalModel);

    expect(selectPlayer0(User0).hand, 'User0.hand').equal(selectPlayer(User0).hand);
    expect(selectPlayer0(User0).continent, 'User0.hand').equal(selectPlayer(User0).continent);

    expect(selectPlayer1(User0).hand, 'User0.hand').size(TEST_HAND_SIZE - 1);
    expect(selectPlayer1(User0).hand, 'User0.hand').not.equal(selectPlayer(User0).hand);
    expect(selectPlayer1(User0).continent, 'User0.hand').equal(selectPlayer(User0).continent);

    /**
     * State: 0-0-1
     * User0: Card#1, Card#2, Card#3, ... | Animal#0
     * User1: Card#0, Card#1, Card#2, ... |
     * */

    expect(selectGame().status.round, 'selectGame().status.round').equal(0);
    expect(selectGame0().status.round, 'ClientGame0().status.round').equal(0);
    expect(selectGame1().status.round, 'ClientGame1().status.round').equal(0);
    expect(selectGame().status.currentPlayer, 'selectGame().status.currentPlayer').equal(User1.id);
    expect(selectGame0().status.currentPlayer, 'ClientGame0().status.currentPlayer').equal(User1.id);
    expect(selectGame1().status.currentPlayer, 'ClientGame1().status.currentPlayer').equal(User1.id);
    clientStore1.dispatch(gameDeployAnimalRequest(selectCard(User1, 0).id, 0));

    /**
     * State: 0-1-0
     * User0: Card#1, Card#2, Card#3, ... | Animal#0
     * User1: Card#0, Card#2, Card#3, ... | Animal#1
     * */

    expect(selectGame().status.round, 'selectGame().status.round').equal(1);
    expect(selectGame0().status.round, 'ClientGame0().status.round').equal(1);
    expect(selectGame1().status.round, 'ClientGame1().status.round').equal(1);
    expect(selectGame().status.currentPlayer, 'selectGame().status.currentPlayer').equal(User0.id);
    expect(selectGame0().status.currentPlayer, 'ClientGame0().status.currentPlayer').equal(User0.id);
    expect(selectGame1().status.currentPlayer, 'ClientGame1().status.currentPlayer').equal(User0.id);
    clientStore0.dispatch(gameDeployAnimalRequest(User0OriginalHand.get(2).id, 0));

    /**
     * State: 0-1-1
     * User0: Card#1, Card#3, Card#4, ... | Animal#2, Animal#0
     * User1: Card#0, Card#2, Card#3, ... | Animal#1
     * */

    expect(selectGame().status.round, 'serverGame().status.round').equal(1);
    expect(selectGame0().status.round, 'ClientGame0().status.round').equal(1);
    expect(selectGame1().status.round, 'ClientGame1().status.round').equal(1);
    expect(selectGame().status.currentPlayer, 'selectGame().status.currentPlayer').equal(User1.id);
    expect(selectGame0().status.currentPlayer, 'ClientGame0().status.currentPlayer').equal(User1.id);
    expect(selectGame1().status.currentPlayer, 'ClientGame1().status.currentPlayer').equal(User1.id);
    clientStore1.dispatch(gameDeployAnimalRequest(User1OriginalHand.get(1).id, 1));

    /**
     * State: 0-2-0
     * User0: Card#1, Card#3, Card#4, ... | Animal#2, Animal#0
     * User1: Card#2, Card#3, Card#4, ... | Animal#1, Animal#0
     * */

    expect(selectGame0().status.round, 'selectGame().status.round').equal(2);
    expect(selectGame1().status.round, 'selectGame().status.round').equal(2);
    expect(selectGame().status.round, 'selectGame().status.round').equal(2);
    clientStore0.dispatch(gameDeployAnimalRequest(User0OriginalHand.get(4).id, 1));

    /**
     * State: 0-2-1
     * User0: Card#1, Card#3, Card#5, ... | Animal#2, Animal#4, Animal#0
     * User1: Card#2, Card#3, Card#4, ... | Animal#1, Animal#0
     * */

    expect(selectPlayer(User0).hand, 'Server: User0.hand').size(3);
    expect(selectPlayer(User0).hand.get(0), 'Server: User0.hand.0').equal(User0OriginalHand.get(1));
    expect(selectPlayer(User0).hand.get(1), 'Server: User0.hand.1').equal(User0OriginalHand.get(3));
    expect(selectPlayer(User0).hand.get(2), 'Server: User0.hand.1').equal(User0OriginalHand.get(5));
    expect(selectPlayer(User0).continent, 'Server: User0.continent').size(3);

    expect(selectPlayer(User1).hand, 'Server: User1.hand').size(4);
    expect(selectPlayer(User1).hand.get(0), 'Server: User1.hand.0').equal(User1OriginalHand.get(2));
    expect(selectPlayer(User1).hand.get(1), 'Server: User1.hand.1').equal(User1OriginalHand.get(3));
    expect(selectPlayer(User1).continent, 'Server: User1.continent').size(2);

    expect(selectPlayer0(User0).hand, 'User0.hand').equal(selectPlayer(User0).hand);
    expect(selectPlayer0(User0).continent, 'User0.hand').equal(selectPlayer(User0).continent);

    expect(selectPlayer0(User0).hand, 'User0.hand').equal(selectPlayer(User0).hand);
    expect(selectPlayer0(User0).continent, 'User0.hand').equal(selectPlayer(User0).continent);

    expect(selectPlayer1(User0).hand, 'User0.hand').size(3);
    expect(selectPlayer1(User0).hand, 'User0.hand').not.equal(selectPlayer(User0).hand);
    expect(selectPlayer1(User0).continent, 'User0.hand').equal(selectPlayer(User0).continent);
  });

  it('Play as upgrade', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
players:
  - hand: 1 camo, 1 sharp
    continent: $A
  - hand: 6 camo
    continent: $B
`);
    const {selectGame, selectCard, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);
    const {selectGame0, selectPlayer0, selectAnimal0, selectTrait0} = makeClientGameSelectors(clientStore0.getState, gameId, 0);
    const {selectGame1, selectPlayer1, selectAnimal1, selectTrait1} = makeClientGameSelectors(clientStore1.getState, gameId, 1);

    clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$A'));

    expect(selectPlayer (User0).hand, 'ServerGame.hand').size(1);
    expect(selectPlayer (User0).getIn(['hand', 0, 'type'])).equal('CardSharpVision');
    expect(selectPlayer0(User0).hand, 'selectGame0.hand').size(1);
    expect(selectPlayer0(User0).getIn(['hand', 0, 'type'])).equal('CardSharpVision');
    expect(selectPlayer1(User0).hand, 'ClientGame1.hand').size(1);
    expect(selectPlayer1(User0).getIn(['hand', 0, 'type'])).not.equal('CardSharpVision');

    const traitCamouflage = selectTrait(User0, 0, 0);
    console.log(selectTrait(User0, 0, 0).toJS(), selectTrait0(User0, 0, 0).toJS())
    expect(selectTrait0(User0, 0, 0)).equal(traitCamouflage);
    expect(selectTrait1(User0, 0, 0)).equal(traitCamouflage);

    clientStore1.dispatch(gameEndTurnRequest());

    clientStore0.dispatch(gameDeployTraitRequest(selectCard(User0, 0).id, '$A'));

    expect(selectPlayer(User0).hand).size(0);
    expect(selectPlayer0(User0).hand).size(0);
    expect(selectPlayer1(User0).hand).size(0);

    const traitSharpVision = selectTrait(User0, 0, 1);
    expect(selectAnimal(User0, 0).traits.toList()).equal(List.of(traitCamouflage, traitSharpVision));
    expect(selectAnimal0(User0, 0).traits.toList()).equal(List.of(traitCamouflage, traitSharpVision));
    expect(selectAnimal1(User0, 0).traits.toList()).equal(List.of(traitCamouflage, traitSharpVision));
  });

  it('Play as skip turn', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
players:
  - hand: 5 camo
  - hand: 5 camo
`);
    const {selectGame, selectCard, selectPlayer, selectAnimal, selectTrait} = makeGameSelectors(serverStore.getState, gameId);

    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id));
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id));
    clientStore0.dispatch(gameDeployAnimalRequest(selectCard(User0, 0).id));

    expect(selectGame().getIn(['players', User0.id, 'hand']), 'Server: User0.hand').size(2);
    expect(selectGame().getIn(['players', User1.id, 'hand']), 'Server: User0.hand').size(5);
  });

  it('Reload', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;
    const ClientGame1 = () => clientStore1.getState().get('game');
    clientStore0.dispatch(roomJoinRequest(roomId));
    clientStore1.dispatch(roomJoinRequest(roomId));
    clientStore0.dispatch(roomStartVotingRequest());
    clientStore1.dispatch(roomStartVoteActionRequest(true));
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
    clientStore0.dispatch(roomStartVotingRequest());
    clientStore1.dispatch(roomStartVoteActionRequest(true));
    const gameId = serverStore.getState().get('games').first().id;
    serverStore.clearActions();

    clientStore0.disconnect(SOCKET_DISCONNECT_NOW);
    //console.log(serverStore.getState().getIn(['games', gameId, 'players']).keySeq().toArray())

    clientStore1.disconnect(SOCKET_DISCONNECT_NOW);

    expect(serverStore.getState().get('games')).equal(Map());
  });
});
















