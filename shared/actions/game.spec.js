import {Map, List, fromJS} from 'immutable';
import {UserModel} from '../models/UserModel';
import {RoomModel} from '../models/RoomModel';

import {GameModel} from '../models/game/GameModel';
import {CardModel} from '../models/game/CardModel';
import {PlayerModel} from '../models/game/PlayerModel';

import {roomCreateRequest, roomJoinRequest, gameStartRequest, gameReadyRequest} from '../actions/actions';

describe('Game:', function () {
  it('Start for two:', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;
    clientStore0.dispatch(roomJoinRequest(roomId));
    clientStore1.dispatch(roomJoinRequest(roomId));
    clientStore0.dispatch(gameStartRequest(roomId));
    const Room = serverStore.getState().get('rooms').first();
    const ServerGame = () => serverStore.getState().get('games').first();
    const ClientGame0 = () => clientStore0.getState().get('game');
    expect(ServerGame()).not.undefined;
    expect(ServerGame().roomId).equal(roomId);
    expect(ServerGame().players.size).equal(2);
    expect(ClientGame0(), 'clientStore0.get(game)').ok;
    expect(ClientGame0().id, 'clientStore0.get(game).id').ok;
    clientStore0.dispatch(gameReadyRequest());
    //console.log(serverStore.getState().get('games').toJS())
    //console.log(clientStore0.getState().get('game').toJS())
    expect(ServerGame().players.get(User0.id).status, 'Game.players.get(User0).state 1').equal(1);
    expect(ServerGame().players.get(User1.id).status, 'Game.players.get(User1).state 1').equal(0);
    expect(ServerGame().players.get(User0.id).hand.size).equal(0);
    expect(ServerGame().players.get(User1.id).hand.size).equal(0);
    clientStore1.dispatch(gameReadyRequest());
    expect(ServerGame().players.get(User0.id).status, 'Game.players.get(0).state 2').equal(1);
    expect(ServerGame().players.get(User1.id).status, 'Game.players.get(1).state 2').equal(1);
    // server dispatched turn 1 here
    expect(ServerGame().players.get(User0.id).hand.size).equal(6);
    expect(ServerGame().players.get(User1.id).hand.size).equal(6);
    expect(ClientGame0()).ok;
    expect(ClientGame0().id).equal(ServerGame().id);
    expect(ClientGame0().roomId).equal(roomId);
    expect(ClientGame0().deck).equal(0);
    expect(ClientGame0().hand).ok;
    expect(ClientGame0().hand.size, 'clientGame0.hand.size').equal(6);
  });
});