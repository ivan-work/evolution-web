import {Map, List, fromJS} from 'immutable';
import {UserModel, STATUS} from '../models/UserModel';
import {RoomModel} from '../models/RoomModel';

import {GameModel} from '../models/game/GameModel';
import {CardModel} from '../models/game/CardModel';
import {PlayerModel} from '../models/game/PlayerModel';

import {SOCKET_DISCONNECT_NOW, roomCreateRequest, roomJoinRequest, gameCreateRequest, gameReadyRequest} from '../actions/actions';

describe('Game:', function () {
  it('Start for two', () => {
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
    expect(ServerGame(), 'ServerGame()').ok;
    const DECK_SIZE = ServerGame().deck.size;
    const HAND_SIZE = 6;
    expect(ServerGame().roomId).equal(roomId);
    expect(ServerGame().players.size).equal(2);
    expect(ClientGame0(), 'clientStore0.get(game)').ok;
    expect(ClientGame0().id, 'clientStore0.get(game).id').ok;
    clientStore0.dispatch(gameReadyRequest());
    //console.log(serverStore.getState().get('games').toJS())
    //console.log(clientStore0.getState().get('game').toJS())
    expect(ServerGame().players.get(User0.id).status, 'Game.players.get(User0).status 1').equal(STATUS.READY);
    expect(ServerGame().players.get(User1.id).status, 'Game.players.get(User1).status 1').equal(STATUS.LOADING);
    expect(ServerGame().players.get(User0.id).hand.size).equal(0);
    expect(ServerGame().players.get(User1.id).hand.size).equal(0);
    clientStore1.dispatch(gameReadyRequest());
    expect(ServerGame().players.get(User0.id).status, 'Game.players.get(0).status 2').equal(STATUS.READY);
    expect(ServerGame().players.get(User1.id).status, 'Game.players.get(1).status 2').equal(STATUS.READY);
    expect(ServerGame().deck.size).equal(DECK_SIZE - HAND_SIZE - HAND_SIZE);
    // server dispatched turn 1 here
    expect(ServerGame().players.get(User0.id).hand.size).equal(6);
    expect(ServerGame().players.get(User1.id).hand.size).equal(6);

    expect(ClientGame0()).ok;
    expect(ClientGame0().id).equal(ServerGame().id);
    expect(ClientGame0().roomId).equal(roomId);
    expect(ClientGame0().deck, 'ClientGame0().deck').equal(DECK_SIZE - HAND_SIZE - HAND_SIZE);
    expect(ClientGame0().hand).ok;
    expect(ClientGame0().hand.size, 'clientGame0.hand.size').equal(6);
    expect(ClientGame0().getIn(['players', User0.id, 'hand'])).equal(ClientGame0().hand);
    expect(ClientGame0().getIn(['players', User1.id, 'hand'])).equal(6);

    expect(ClientGame1()).ok;
    expect(ClientGame1().id).equal(ServerGame().id);
    expect(ClientGame1().roomId).equal(roomId);
    expect(ClientGame1().deck).equal(DECK_SIZE - HAND_SIZE - HAND_SIZE);
    expect(ClientGame1().hand).ok;
    expect(ClientGame1().hand.size, 'clientGame1.hand.size').equal(6);
    expect(ClientGame1().getIn(['players', User1.id, 'hand'])).equal(ClientGame1().hand);
    expect(ClientGame1().getIn(['players', User0.id, 'hand'])).equal(6);
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
});