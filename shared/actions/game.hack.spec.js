import sinon from 'sinon';
//import {Map, List, fromJS} from 'immutable';
//import {UserModel, STATUS} from '../models/UserModel';
//import {RoomModel} from '../models/RoomModel';
//
//import {GameModel, TEST_DECK_SIZE, TEST_HAND_SIZE} from '../models/game/GameModel';
//import {CardModel} from '../models/game/CardModel';
//import {AnimalModel} from '../models/game/evolution/AnimalModel';
//import {PlayerModel} from '../models/game/PlayerModel';
//
import {roomCreateRequest, roomJoinRequest, gameCreateRequest, gameReadyRequest, gamePlayCard} from '../actions/actions';

const expectUnchanged = (cb, ...stores) => {
  let previousStates = stores.map(store => store.getState());
  cb();
  stores.forEach((store, i) => {
    expect(store.getState()).equal(previousStates[i]);
  });
};

describe('Game:', function () {
  //it('Game for two', () => {

  // Wrong gameCreateRequest:
  //previousServerState = serverStore.getState();
  //previousClientState = clientStore0.getState();
  //clientStore0.dispatch(gameCreateRequest(null));
  //expect(previousServerState).equal(serverStore.getState());
  //expect(previousClientState).equal(clientStore0.getState());
  //
  //})
  it('Game for two', () => {
    let previousServerState;
    let previousClientState;
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}, {clientStore2, User2}] = mockStores(3);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;
    clientStore0.dispatch(roomJoinRequest(roomId));
    clientStore1.dispatch(roomJoinRequest(roomId));

    clientStore0.dispatch(gameCreateRequest(roomId));
    const ServerGame = () => serverStore.getState().get('games').first();
    const ClientGame0 = () => clientStore0.getState().get('game');
    const ClientGame1 = () => clientStore1.getState().get('game');

    // gameReadyRequest, wrong gameId
    expectUnchanged(() => {
      clientStore0.dispatch({
        type: 'gameReadyRequest'
        , data: {gameId: null}
        , meta: {server: true}
      })
    }, serverStore, clientStore0);

    // gameReadyRequest, wrong user
    expectUnchanged(() => {
      clientStore2.dispatch({
        type: 'gameReadyRequest'
        , data: {gameId: ServerGame().id}
        , meta: {server: true}
      })
    }, serverStore, clientStore2);

    clientStore0.dispatch(gameReadyRequest());
    clientStore1.dispatch(gameReadyRequest());
    //const Room = serverStore.getState().get('rooms').first();
    //const ServerGame = () => serverStore.getState().get('games').first();
    //const ClientGame0 = () => clientStore0.getState().get('game');
    //const ClientGame1 = () => clientStore1.getState().get('game');
    //const getUser0Card = (i) => clientStore0.getState().get('game').getPlayer().hand.get(i);
    //
    //const User0Card0 = getUser0Card(0);
    //const User0Card1 = getUser0Card(1);
    //const User0Card2 = getUser0Card(2);
    //const User0Card3 = getUser0Card(3);
    //
    //clientStore0.dispatch(gamePlayCard(User0Card0.id, 0, 0));
  });
});