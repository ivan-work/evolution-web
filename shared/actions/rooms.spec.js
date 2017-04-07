import {Map, List, fromJS} from 'immutable';
import {UserModel} from '../models/UserModel';
import {RoomModel} from '../models/RoomModel';
import {loginUserRequest, roomCreateRequest, roomJoinRequest} from '../actions/actions';

describe('Rooms:', function () {
  var sandbox;
  var UserSpy;
  var RoomSpy;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    UserSpy = sandbox.spy(UserModel, 'new');
    RoomSpy = sandbox.spy(RoomModel, 'new');
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('Create:', function () {
    it('Simple Success', () => {
      const serverStore = mockServerStore();
      const clientStore = mockClientStore().connect(serverStore);
      clientStore.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
      const User0 = UserSpy.lastCall.returnValue;
      serverStore.clearActions();
      clientStore.clearActions();

      clientStore.dispatch(roomCreateRequest());
      const Room = new RoomModel({
        ...RoomSpy.lastCall.returnValue.toJS()
        , users: List([User0.id])
      });

      expect(serverStore.getActionType(0)).eql('roomCreateSuccess');
      expect(serverStore.getActionType(1)).eql('roomJoinSuccess');

      expect(serverStore.getState().get('rooms'), 'serverStore.rooms').equal(Map({
        [Room.id]: Room
      }));

      expect(clientStore.getActions().length).equal(4);
      expect(clientStore.getActionType(0)).equal('roomCreateRequest');
      expect(clientStore.getActionType(1)).equal('roomCreateSuccess');
      expect(clientStore.getActionType(2)).equal('roomJoinSuccess');
      expect(clientStore.getActionType(3)).equal('roomJoinSuccessSelf');

      expect(clientStore.getState().get('room'), 'clientStore.room').equal(Room);
      expect(clientStore.getState().get('rooms'), 'clientStore.rooms').equal(Map({[Room.id]: Room}));
    });

    it('Simple Join', () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      const clientStore1 = mockClientStore().connect(serverStore);
      clientStore0.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
      const User0 = UserSpy.lastCall.returnValue;
      clientStore1.dispatch(loginUserRequest('/test', 'User1', 'testPassword'));
      const User1 = UserSpy.lastCall.returnValue;
      serverStore.clearActions();
      clientStore0.clearActions();
      clientStore1.clearActions();

      clientStore0.dispatch(roomCreateRequest());
      const Room = new RoomModel({
        ...RoomSpy.lastCall.returnValue.toJS()
        , users: List([User0.id, User1.id])
      });
      clientStore1.dispatch(roomJoinRequest(Room.id));
      ;
      expect(serverStore.getActions().length).equal(3);
      expect(serverStore.getActionType(0)).eql('roomCreateSuccess');
      expect(serverStore.getActionType(1)).eql('roomJoinSuccess');
      expect(serverStore.getActionType(2)).eql('roomJoinSuccess');

      expect(serverStore.getState().get('rooms'), 'serverStore.rooms').equal(Map({
        [Room.id]: Room
      }));

      console.log(clientStore1.getActionTypes())
      expect(clientStore0.getActionTypes()).eql([
        'roomCreateRequest'
        , 'roomCreateSuccess'
        , 'roomJoinSuccess'
        , 'roomJoinSuccessSelf'
        , 'roomJoinSuccess']);

      expect(clientStore0.getState().get('room'), 'clientStore0.room').equal(Room);
      expect(clientStore0.getState().get('rooms'), 'clientStore0.rooms').equal(Map({[Room.id]: Room}));

      expect(clientStore1.getActions().length).equal(5);
      expect(clientStore1.getActionType(0)).equal('roomCreateSuccess');
      expect(clientStore1.getActionType(1)).equal('roomJoinSuccess');
      expect(clientStore1.getActionType(2)).equal('roomJoinRequest');
      expect(clientStore1.getActionType(3)).equal('roomJoinSuccess');
      expect(clientStore1.getActionType(4)).equal('roomJoinSuccessSelf');

      expect(clientStore1.getState().get('room'), 'clientStore0.room').equal(Room);
      expect(clientStore1.getState().get('rooms'), 'clientStore0.rooms').equal(Map({[Room.id]: Room}));
    });


    //it('Room0[User0, User1] Room2[User2]', () => {
    //  const serverStore = mockServerStore();
    //  const clientStore0 = mockClientStore().connect(serverStore);
    //  const clientStore1 = mockClientStore().connect(serverStore);
    //  const clientStore2 = mockClientStore().connect(serverStore);
    //  clientStore0.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
    //  const User0 = UserSpy.lastCall.returnValue;
    //  clientStore1.dispatch(loginUserRequest('/test', 'User1', 'testPassword'));
    //  const User1 = UserSpy.lastCall.returnValue;
    //  clientStore2.dispatch(loginUserRequest('/test', 'User2', 'testPassword'));
    //  const User2 = UserSpy.lastCall.returnValue;
    //  //serverStore.clearActions();
    //  //clientStore0.clearActions();
    //  //clientStore1.clearActions();
    //  //clientStore2.clearActions();
    //
    //  clientStore0.dispatch(roomCreateRequest());
    //  const Room0 = new RoomModel({
    //    ...RoomSpy.lastCall.returnValue.toJS()
    //    , users: List([User0.id, User1.id])
    //  });
    //  clientStore2.dispatch(roomCreateRequest());
    //  const Room2 = new RoomModel({
    //    ...RoomSpy.lastCall.returnValue.toJS()
    //    , users: List([User2.id])
    //  });
    //
    //  //expect(serverStore.getActionType(0)).eql('roomCreateSuccess');
    //  //expect(serverStore.getActionType(1)).eql('roomJoinSuccess');
    //  //expect(serverStore.getActionType(0)).eql('roomCreateSuccess');
    //  //expect(serverStore.getActionType(1)).eql('roomJoinSuccess');
    //  //expect(serverStore.getActionType(1)).eql('roomJoinSuccess');
    //
    //  expect(serverStore.getState().get('rooms'), 'serverStore.rooms').equal(Map({
    //    [Room0.id]: Room0
    //    , [Room2.id]: Room2
    //  }));
    //  //
    //  //expect(clientStore.getActionType(0)).equal('roomCreateRequest');
    //  //expect(clientStore.getActionType(1)).equal('roomCreateSuccess');
    //  //expect(clientStore.getActionType(2)).equal('roomJoinSuccessSelf');
    //
    //  expect(clientStore0.getState().get('room'), 'clientStore.room').equal(Room);
    //  expect(clientStore0.getState().get('rooms'), 'clientStore.rooms').equal(Map({[Room.id]: Room}));
    //
    //  //expect(clientStore1.getState().get('room'), 'clientStore.room').equal(Room);
    //  //expect(clientStore1.getState().get('rooms'), 'clientStore.rooms').equal(Map({[Room.id]: Room}));
    //
    //  expect(clientStore2.getState().get('room'), 'clientStore.room').equal(Room);
    //  expect(clientStore2.getState().get('rooms'), 'clientStore.rooms').equal(Map({[Room.id]: Room}));
    //});
  });
});