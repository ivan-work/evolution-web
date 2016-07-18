import {Map, List} from 'immutable';
import {UserModel} from '../models/UserModel';
import {authServerToClient, authClientToServer, socketConnect, socketDisconnect, loginUserRequest, loginUserSuccess, loginUserFailure} from './auth';

//console.log('-----');
//console.log('clientStore:');
//console.log(clientStore.getState().toJS());
//console.log(clientStore.getActions());
//
//console.log('-----');
//console.log('serverStore:');
//console.log(serverStore.getState().toJS());
//console.log(serverStore.getActions());


describe('Auth:', function () {
  var sandbox;
  var UserSpy;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    UserSpy = sandbox.spy(UserModel, 'new');
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('socketConnect', () => {
    const serverStore = mockServerStore();
    const clientStore = mockClientStore().connect(serverStore);
    expect(serverStore.getActions(), 'serverStore.getActions()').eql([{
      type: 'socketConnect',
      data: clientStore.getConnection()
    }]);
    expect(serverStore.getState().get('connections')).equal(Map({[clientStore.getConnectionId()]: clientStore.getSocket()}));
    expect(serverStore.getState().get('users')).equal(Map());
  });

  it('socketDisconnect', () => {
    const serverStore = mockServerStore();
    const clientStore = mockClientStore().connect(serverStore);

    serverStore.clearActions();
    clientStore.clearActions();

    serverStore.dispatch(socketDisconnect(clientStore.getConnectionId()));

    expect(serverStore.getActions(), 'serverStore.getActions()').eql([
      {type: 'socketDisconnect', data: {connectionId: clientStore.getConnectionId()}}
    ]);

    expect(serverStore.getState().get('connections')).equal(Map());
    expect(serverStore.getState().get('users')).equal(Map());
  });

  describe('loginUserRequest:', () => {
    it('single User:', () => {
      const serverStore = mockServerStore();
      const clientStore = mockClientStore().connect(serverStore);

      serverStore.clearActions();
      clientStore.dispatch(loginUserRequest('/test', 'testLogin', 'testPassword'));
      const User0 = UserSpy.lastCall.returnValue;

      /*
       * Client Actions
       * */

      expect(clientStore.getActionType(0), 'clientStore.getActionType(0)').eql('loginUserRequest');
      expect(clientStore.getActionType(1), 'clientStore.getActionType(1)').eql('loginUserSuccess');
      expect(clientStore.getActionData(1).user, 'clientStore.getActionData(2)').equal(User0);
      expect(clientStore.getActionType(2), 'clientStore.getActionType(3)').eql('@@router/CALL_HISTORY_METHOD');
      expect(clientStore.getAction(2).payload, 'clientStore.getAction(3).payload').eql({
        method: 'push',
        args: ['/test']
      });
      expect(clientStore.getActionType(3), 'clientStore.getActionType(4)').eql('loginState');
      expect(clientStore.getActionData(3), 'clientStore.getActionData(4)').eql({
        online: List.of(User0.toOthers())
        , rooms: Map()
      });
      expect(clientStore.getActions().length, 'clientStore.getActions().length').equal(4);

      /*
       * Server Actions
       * */
      expect(serverStore.getActions().length, 'serverStore.getActions().length').equal(3);

      expect(serverStore.getActionType(0), 'serverStore.getActionType(0)').eql('onlineJoin');
      expect(serverStore.getActionData(0), 'serverStore.getActionData(0)').eql({user: User0.toOthers()});

      expect(serverStore.getActionType(1), 'serverStore.getActionType(1)').eql('loginUserSuccess');
      expect(serverStore.getActionData(1), 'serverStore.getActionData(1)').eql({user: User0, redirect: '/test'});

      expect(serverStore.getActionType(2), 'serverStore.getActionType(2)').eql('loginState');
      expect(serverStore.getActionData(2), 'serverStore.getActionData(2)').eql({online: [User0.toOthers()], rooms: {}});

      /*
       * States
       * */
      expect(clientStore.getState().get('user')).equal(User0);
      expect(clientStore.getState().get('online')).equal(List([User0.toOthers()]));

      expect(serverStore.getState().get('connections')).equal(Map({[clientStore.getConnectionId()]: clientStore.getConnection().socket}));
      expect(serverStore.getState().get('users')).equal(Map({[User0.id]: User0}));
    });

    it('two Users', () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      const clientStore1 = mockClientStore().connect(serverStore);
      serverStore.clearActions();

      clientStore0.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
      const User0 = UserSpy.lastCall.returnValue;

      /*
       * User0 connects
       * */
      expect(serverStore.getState().get('connections')).equal(Map({
        [clientStore0.getConnectionId()]: clientStore0.getConnection().socket
        , [clientStore1.getConnectionId()]: clientStore1.getConnection().socket
      }));
      expect(serverStore.getState().get('users')).equal(Map({[User0.id]: User0}));

      expect(clientStore0.getState().get('user'), 'clientStore0.getState(users)').equal(User0);
      expect(clientStore0.getState().get('online'), 'clientStore0.getState(online)')
        .equal(List([User0.toOthers()]));

      /*
       * User1 is connected, but not logged in
       * */
      expect(clientStore1.getState().get('user'), 'clientStore1.getState(users)').equal(null);
      expect(clientStore1.getState().get('online'), 'clientStore1.getState(online)').equal(List());

      /*
       * User1 connects
       * */
      clientStore1.dispatch(loginUserRequest('/test', 'User1', 'testPassword'));
      const User1 = UserSpy.lastCall.returnValue;

      expect(clientStore0.getState().get('user'), 'clientStore0.getState(user)').equal(User0);
      expect(clientStore0.getState().get('online'), 'clientStore0.getState(online)')
        .equal(List([User0.toOthers(), User1.toOthers()]));

      expect(clientStore1.getState().get('user'), 'clientStore1.getState(users)').equal(User1);
      expect(clientStore1.getState().get('online'), 'clientStore1.getState(online)')
        .equal(List.of(User0.toOthers(), User1.toOthers()));
    });
  });
  describe('disconnecting', function () {
    it('clears everything', (done) => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      const clientStore1 = mockClientStore().connect(serverStore);
      clientStore0.dispatch(loginUserRequest('/test', 'testLogin', 'testPassword'));
      const User0 = UserSpy.lastCall.returnValue;
      serverStore.clearActions();

      clientStore0.getClient().disconnect();
      clientStore1.getClient().disconnect();

      setTimeout(() => {
        expect(serverStore.getState().get('connections')).equal(Map());
        expect(serverStore.getState().get('users')).equal(Map());

        //expect(serverStore.getActionType(0)).eql('socketDisconnect');
        //expect(serverStore.getActionData(0)).eql({connectionId: clientStore0.getConnectionId()});
        //
        //expect(serverStore.getActionType(1)).eql('@@reduxTimeout/addTimeout');
        //
        //expect(serverStore.getActionType(2)).eql('socketDisconnect');
        //expect(serverStore.getActionData(2)).eql({connectionId: clientStore1.getConnectionId()});
        //
        //expect(serverStore.getActionType(3)).eql('logoutUser');
        //expect(serverStore.getActionData(3)).eql({userId: User0.id});
        done();
      }, 20);
    });
  });

  describe('LocalStorage:', () => {
    it('Remembers User', (done) => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      clientStore0.dispatch(loginUserRequest('/test', 'testLogin', 'testPassword'));
      const User = UserSpy.lastCall.returnValue;
      //console.log('serverStore', serverStore.clearActions());
      clientStore0.getClient().disconnect();
      const clientStore1 = mockClientStore(Map({user: User})).connect(serverStore);

      expect(serverStore.getState().get('users')).equal(Map({[User.id]: User.set('connectionId', clientStore1.getConnectionId())}));
      expect(serverStore.getState().get('connections')).equal(Map({[clientStore1.getConnectionId()]: clientStore1.getSocket()}));

      setTimeout(() => {
        //console.log('serverStore', serverStore.getActions());
        // Check for login timeout
        expect(serverStore.getState().get('users')).equal(Map({
          [User.id]: User.set('connectionId', clientStore1.getConnectionId())
        }));
        expect(serverStore.getState().get('connections')).equal(Map({[clientStore1.getConnectionId()]: clientStore1.getSocket()}));
        done();
      }, 20);
    });

    it('Doesnt allow two Users:', (done) => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      clientStore0.dispatch(loginUserRequest('/test', 'testLogin', 'testPassword'));
      const User = UserSpy.lastCall.returnValue;
      //console.log('serverStore', serverStore.clearActions());
      const clientStore1 = mockClientStore(Map({user: User})).connect(serverStore);

      expect(serverStore.getState().get('users')).equal(Map({[User.id]: User}));
      expect(serverStore.getState().get('connections')).equal(Map({
        [clientStore0.getConnectionId()]: clientStore0.getSocket()
        , [clientStore1.getConnectionId()]: clientStore1.getSocket()
      }));
      setTimeout(() => {
        expect(serverStore.getState().get('users')).equal(Map({[User.id]: User}));
        expect(serverStore.getState().get('connections')).equal(Map({
          [clientStore0.getConnectionId()]: clientStore0.getSocket()
          , [clientStore1.getConnectionId()]: clientStore1.getSocket()
        }));
        done();
      }, 20);
    });
  });
});