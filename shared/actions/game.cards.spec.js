////import {Map, List, fromJS} from 'immutable';
////import {UserModel, STATUS} from '../models/UserModel';
////import {RoomModel} from '../models/RoomModel';
////
////import {GameModel, TEST_DECK_SIZE, TEST_HAND_SIZE} from '../models/game/GameModel';
////import {CardModel} from '../models/game/CardModel';
////import {AnimalModel} from '../models/game/evolution/AnimalModel';
////import {PlayerModel} from '../models/game/PlayerModel';
////
////import {SOCKET_DISCONNECT_NOW, roomCreateRequest, roomJoinRequest, gameCreateRequest, gameReadyRequest, gameDeployAnimalRequest} from '../actions/actions';
//
//describe('Game:', function () {
//  it('Game for two', () => {
//    const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
//    clientStore0.dispatch(roomCreateRequest());
//    const roomId = serverStore.getState().get('rooms').first().id;
//    clientStore0.dispatch(roomJoinRequest(roomId));
//    clientStore1.dispatch(roomJoinRequest(roomId));
//    clientStore0.dispatch(gameCreateRequest(roomId));
//    clientStore0.dispatch(gameReadyRequest());
//    clientStore1.dispatch(gameReadyRequest());
//    const Room = serverStore.getState().get('rooms').first();
//    const ServerGame = () => serverStore.getState().get('games').first();
//    const ClientGame0 = () => clientStore0.getState().get('game');
//    const ClientGame1 = () => clientStore1.getState().get('game');
//    const getUser0Card = (i) => clientStore0.getState().get('game').getPlayer().hand.get(i);
//
//    const User0Card0 = getUser0Card(0);
//    const User0Card1 = getUser0Card(1);
//    const User0Card2 = getUser0Card(2);
//    const User0Card3 = getUser0Card(3);
//
//    clientStore0.dispatch(gameDeployAnimalRequest(User0Card0.id, 0, 0));
//  });
//});