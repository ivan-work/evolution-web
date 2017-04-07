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
    it('Simple Create', () => {
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

      expect(clientStore.getActionType(0)).equal('roomCreateRequest');
      expect(clientStore.getActionType(1)).equal('roomCreateSuccess');
      expect(clientStore.getActionType(2)).equal('roomJoinSuccess');
      expect(clientStore.getActionType(3)).equal('roomJoinSuccessSelf');
      expect(clientStore.getActionType(4)).equal('@@router/CALL_HISTORY_METHOD');
      expect(clientStore.getAction(4).payload.args).eql([`/room/${Room.id}`]);
      expect(clientStore.getActions().length).equal(5);

      expect(clientStore.getState().get('room'), 'clientStore.room').equal(Room.id);
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
      expect(serverStore.getActions().length).equal(3);
      expect(serverStore.getActionType(0)).eql('roomCreateSuccess');
      expect(serverStore.getActionType(1)).eql('roomJoinSuccess');
      expect(serverStore.getActionType(2)).eql('roomJoinSuccess');

      expect(serverStore.getState().get('rooms'), 'serverStore.rooms').equal(Map({
        [Room.id]: Room
      }));


      expect(clientStore0.getActionType(0)).equal('roomCreateRequest');
      expect(clientStore0.getActionType(1)).equal('roomCreateSuccess');
      expect(clientStore0.getActionType(2)).equal('roomJoinSuccess');
      expect(clientStore0.getActionType(3)).equal('roomJoinSuccessSelf');
      expect(clientStore0.getActionType(4)).equal('@@router/CALL_HISTORY_METHOD');
      expect(clientStore0.getAction(4).payload.args).eql([`/room/${Room.id}`]);
      expect(clientStore0.getActionType(5)).equal('roomJoinSuccess');
      expect(clientStore0.getActions().length).equal(6);

      expect(clientStore0.getState().get('room'), 'clientStore0.room').equal(Room.id);
      expect(clientStore0.getState().get('rooms'), 'clientStore0.rooms').equal(Map({[Room.id]: Room}));

      expect(clientStore1.getActionType(0)).equal('roomCreateSuccess');
      expect(clientStore1.getActionType(1)).equal('roomJoinSuccess');
      expect(clientStore1.getActionType(2)).equal('roomJoinRequest');
      expect(clientStore1.getActionType(3)).equal('roomJoinSuccess');
      expect(clientStore1.getActionType(4)).equal('roomJoinSuccessSelf');
      expect(clientStore1.getActionType(5)).equal('@@router/CALL_HISTORY_METHOD');
      expect(clientStore1.getAction(5).payload.args).eql([`/room/${Room.id}`]);
      expect(clientStore1.getActions().length).equal(6);

      expect(clientStore1.getState().get('room'), 'clientStore0.room').equal(Room.id);
      expect(clientStore1.getState().get('rooms'), 'clientStore0.rooms').equal(Map({[Room.id]: Room}));
    });

    it('User0 creates Room, User1 logins', () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      const clientStore1 = mockClientStore().connect(serverStore);

      clientStore0.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
      const User0 = UserSpy.lastCall.returnValue;
      clientStore0.dispatch(roomCreateRequest());

      const Room = new RoomModel({
        ...RoomSpy.lastCall.returnValue.toJS()
        , users: List([User0.id])
      });

      console.log('all good')

      clientStore1.dispatch(loginUserRequest('/test', 'User1', 'testPassword'));
      const User1 = UserSpy.lastCall.returnValue;

      expect(serverStore.getState().get('rooms'), 'serverStore.rooms').equal(Map({
        [Room.id]: Room
      }));

      expect(clientStore0.getState().get('room'), 'clientStore0.room').equal(Room.id);
      expect(clientStore0.getState().get('rooms'), 'clientStore0.rooms').equal(Map({[Room.id]: Room}));

      expect(clientStore1.getState().get('room'), 'clientStore1.room').equal(null);
      expect(clientStore1.getState().get('rooms'), 'clientStore1.rooms').equal(Map({[Room.id]: Room}));
    });
  });
});