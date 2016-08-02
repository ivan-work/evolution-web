import {Map, List, fromJS} from 'immutable';
import {UserModel} from '../models/UserModel';
import {RoomModel} from '../models/RoomModel';

import {GameModel} from '../models/game/GameModel';
import {CardModel} from '../models/game/CardModel';
import {PlayerModel} from '../models/game/PlayerModel';

import {roomCreateRequest, roomJoinRequest, roomStartGameRequest} from '../actions/actions';

describe('Game:', function () {
  it('Start for two:', () => {
    //const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
    //clientStore0.dispatch(roomCreateRequest());
    //const roomId = serverStore.getState().get('rooms').first().id;
    //clientStore0.dispatch(roomJoinRequest(roomId));
    //clientStore1.dispatch(roomJoinRequest(roomId));
    //clientStore0.dispatch(roomStartGameRequest(roomId));
    //const Room = serverStore.getState().get('rooms').first();
    //const Game = serverStore.getState().get('games').first();
    //expect(Game).defined;
    //expect(Game.roomId).equal(roomId);
    //expect(Game.players).equal(List.of(
    //  new PlayerModel({
    //    id: User0.id
    //    , hand: List()
    //  })
    //  , new PlayerModel({
    //    id: User1.id
    //    , hand: List()
    //  })
    //));
  });
});