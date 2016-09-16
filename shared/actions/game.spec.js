import {Map, List, fromJS} from 'immutable';
import {UserModel, STATUS} from '../models/UserModel';
import {RoomModel} from '../models/RoomModel';

import {GameModel, TEST_DECK_SIZE, TEST_HAND_SIZE} from '../models/game/GameModel';
import {CardModel} from '../models/game/CardModel';
import {PlayerModel} from '../models/game/PlayerModel';

import {SOCKET_DISCONNECT_NOW, roomCreateRequest, roomJoinRequest, gameCreateRequest, gameReadyRequest, gamePlayCard} from '../actions/actions';

describe('Game:', function () {
  it('Game for two', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;
    clientStore0.dispatch(roomJoinRequest(roomId));
    clientStore1.dispatch(roomJoinRequest(roomId));
    clientStore0.dispatch(gameCreateRequest(roomId));
    const Room = serverStore.getState().get('rooms').first();
    const ServerGame = () => serverStore.getState().get('games').first();
    const ClientGame0 = () => clientStore0.getState().get('game');
    const ClientGame1 = () => clientStore1.getState().get('game');

    expect(ServerGame().roomId).equal(roomId);
    expect(ServerGame().players.size).equal(2);

    expect(ClientGame0(), 'clientStore0.get(game)').ok;
    expect(ClientGame0().id, 'clientStore0.get(game).id').ok;

    clientStore0.dispatch(gameReadyRequest());

    expect(ServerGame().players.get(User0.id).status, 'Game.players.get(User0).status 1').equal(STATUS.READY);
    expect(ServerGame().players.get(User1.id).status, 'Game.players.get(User1).status 1').equal(STATUS.LOADING);

    expect(ServerGame().players.get(User0.id).hand.size).equal(0);
    expect(ServerGame().players.get(User1.id).hand.size).equal(0);

    clientStore1.dispatch(gameReadyRequest());

    const checkFinalGame = () => {
      expect(ServerGame().players.get(User0.id).status, 'Game.players.get(0).status 2').equal(STATUS.READY);
      expect(ServerGame().players.get(User1.id).status, 'Game.players.get(1).status 2').equal(STATUS.READY);
      expect(ServerGame().deck.size).equal(TEST_DECK_SIZE - TEST_HAND_SIZE - TEST_HAND_SIZE);
      expect(ServerGame().players.get(User0.id).hand.size).equal(TEST_HAND_SIZE);
      expect(ServerGame().players.get(User1.id).hand.size).equal(TEST_HAND_SIZE);

      expect(ServerGame().players.get(User0.id).hand.size).equal(TEST_HAND_SIZE);
      expect(ServerGame().players.get(User1.id).hand.size).equal(TEST_HAND_SIZE);

      expect(ClientGame0()).ok;
      expect(ClientGame0().id).equal(ServerGame().id);
      expect(ClientGame0().roomId).equal(roomId);
      expect(ClientGame0().deck, 'ClientGame0().deck').equal(TEST_DECK_SIZE - TEST_HAND_SIZE - TEST_HAND_SIZE);
      expect(ClientGame0().getIn(['players']).size).equal(2);
      expect(ClientGame0().getIn(['players', User0.id, 'hand'])).equal(ServerGame().getIn(['players', User0.id, 'hand']));
      expect(ClientGame0().getIn(['players', User1.id, 'hand'])).not.equal(ServerGame().getIn(['players', User1.id, 'hand']));
      expect(ClientGame0().getPlayer()).equal(ServerGame().getIn(['players', User0.id]));

      expect(ClientGame1()).ok;
      expect(ClientGame1().id).equal(ServerGame().id);
      expect(ClientGame1().roomId).equal(roomId);
      expect(ClientGame1().deck, 'ClientGame0().deck').equal(TEST_DECK_SIZE - TEST_HAND_SIZE - TEST_HAND_SIZE);
      expect(ClientGame1().getIn(['players']).size).equal(2);
      expect(ClientGame1().getIn(['players', User0.id, 'hand'])).not.equal(ServerGame().getIn(['players', User0.id, 'hand']));
      expect(ClientGame1().getIn(['players', User1.id, 'hand'])).equal(ServerGame().getIn(['players', User1.id, 'hand']));
      expect(ClientGame1().getPlayer()).equal(ServerGame().getIn(['players', User1.id]));
    };

    // server dispatched turn 1 here
    checkFinalGame();

    // duplicate ready request test
    clientStore1.dispatch(gameReadyRequest());
    checkFinalGame();

    clientStore0.dispatch(gamePlayCard(ClientGame0().getIn(['player', 'hand', 0]), 0, 0))

    expect(ClientGame0().getPlayer().continent.size, 'User0.continent').equal(1);
    expect(ClientGame0().getPlayer().continent.get(0), 'User0.continent(animal)').ok;
    expect(ClientGame0().getPlayer().hand.size, 'User0.hand').equal(TEST_HAND_SIZE - 1);

    expect(ClientGame1().getIn(['players', User0.id, 'continent']).size, 'User1 see User0.continent').equal(1);
    expect(ClientGame1().getIn(['players', User0.id, 'continent', 0]), 'User1 see User0.continent').ok;
    expect(ClientGame1().getIn(['players', User0.id, 'hand']).size, 'User1 see User0.hand').equal(TEST_HAND_SIZE - 1);
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

    clientStore1.getClient().disconnect();

    expect(ClientGame1()).null;

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