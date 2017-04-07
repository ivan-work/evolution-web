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
import {
  roomCreateRequest,
  roomJoinRequest,
  gameCreateRequest,
  gameCreateSuccess,
  gameReadyRequest,
  gamePlayCard
} from '../actions/actions';

const expectUnchanged = (cb, ...stores) => {
  let previousStates = stores.map(store => store.getState());
  cb();
  stores.forEach((store, i) => {
    expect(store.getState().toJS()).eql(previousStates[i].toJS());
  });
};
const expectChanged = (cb, ...stores) => {
  let previousStates = stores.map(store => store.getState());
  cb();
  stores.forEach((store, i) => {
    expect(store.getState()).not.equal(previousStates[i]);
  });
};

describe('Hacking Game:', function () {
  //it('Game for two', () => {

  // Wrong gameCreateRequest:
  //previousServerState = serverStore.getState();
  //previousClientState = clientStore0.getState();
  //clientStore0.dispatch(gameCreateRequest(null));
  //expect(previousServerState).equal(serverStore.getState());
  //expect(previousClientState).equal(clientStore0.getState());
  //
  //})
  it('gameReadyRequest', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}, {clientStore2, User2}] = mockStores(3);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;
    clientStore0.dispatch(roomJoinRequest(roomId));
    clientStore1.dispatch(roomJoinRequest(roomId));
    clientStore0.dispatch(gameCreateRequest(roomId));
    const ServerGame = () => serverStore.getState().get('games').first();
    const ClientGame0 = () => clientStore0.getState().get('game');
    const ClientGame1 = () => clientStore1.getState().get('game');
    clientStore2.dispatch(gameCreateSuccess(ServerGame()));

    // gameReadyRequest, wrong gameId
    expectUnchanged(() => clientStore0.dispatch({
      type: 'gameReadyRequest'
      , data: {gameId: null}
      , meta: {server: true}
    }), serverStore, clientStore0);

    // gameReadyRequest, wrong user
    expectUnchanged(() => clientStore2.dispatch(gameReadyRequest())
      , serverStore, clientStore2);

    // gameReadyRequest, double user
    clientStore0.dispatch(gameReadyRequest());
    expectUnchanged(() => clientStore0.dispatch(gameReadyRequest())
      , serverStore, clientStore0);

    // gameReadyRequest, double
    clientStore1.dispatch(gameReadyRequest());
    expectUnchanged(() => clientStore1.dispatch(gameReadyRequest())
      , serverStore, clientStore1);
  });

  it('gamePlayCard', () => {
    const [serverStore, {clientStore0, User0}, {clientStore1, User1}, {clientStore2, User2}] = mockStores(3);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;
    clientStore0.dispatch(roomJoinRequest(roomId));
    clientStore1.dispatch(roomJoinRequest(roomId));
    clientStore0.dispatch(gameCreateRequest(roomId));
    clientStore0.dispatch(gameReadyRequest());
    clientStore1.dispatch(gameReadyRequest());
    const ServerGame = () => serverStore.getState().get('games').first();
    const ClientGame0 = () => clientStore0.getState().get('game');
    const ClientGame1 = () => clientStore1.getState().get('game');
    const getUser0Card = (i) => clientStore0.getState().get('game').getPlayer().hand.get(i);
    const getUser1Card = (i) => clientStore1.getState().get('game').getPlayer().hand.get(i);
    clientStore2.dispatch(gameCreateSuccess(ServerGame()));

    // gamePlayCard empty
    expectUnchanged(() => clientStore0.dispatch(gamePlayCard())
      , serverStore, clientStore0);

    // gamePlayCard hacker, empty
    expectUnchanged(() => clientStore2.dispatch(gamePlayCard())
      , serverStore, clientStore2);

    // gamePlayCard (0:0:0) User1 not in turn
    expectUnchanged(() => clientStore1.dispatch(gamePlayCard(getUser1Card(0).id, 0, 0))
      , serverStore, clientStore1);

    // gamePlayCard (0:0:0) User0 turn
    expectChanged(() => clientStore0.dispatch(gamePlayCard(getUser0Card(0).id, 0, 0)), serverStore, clientStore0);
    expect(ServerGame().status.player, 'ServerGame().status.player').equal(1);

    // gamePlayCard (0:0:1) User0 second try
    expectUnchanged(() => clientStore0.dispatch(gamePlayCard(getUser0Card(0).id, 0, 0))
      , serverStore, clientStore0);

    // gamePlayCard (0:0:1) User1 turn
    expectChanged(() => clientStore1.dispatch(gamePlayCard(getUser1Card(1).id, 0, 0)), serverStore, clientStore1);
    expect(ServerGame().status.round, 'ServerGame().status.player').equal(1);
    expect(ServerGame().status.player, 'ServerGame().status.player').equal(0);

    // gamePlayCard (0:1:0) User1 second try
    expectUnchanged(() => clientStore1.dispatch(gamePlayCard(getUser1Card(0).id, 0, 0))
      , serverStore, clientStore1);
  });
});
















