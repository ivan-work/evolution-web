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
      clientStore0.dispatch(loginUserRequest('/User0', 'User0', 'User0'));
      const User0 = UserSpy.lastCall.returnValue;
      clientStore1.dispatch(loginUserRequest('/User1', 'User1', 'User1'));
      const User1 = UserSpy.lastCall.returnValue;


      serverStore.clearActions();
      clientStore1.clearActions();

      clientStore0.disconnect();

      setTimeout(() => {
        expect(serverStore.getState().get('connections')).equal(Map({[clientStore1.getConnectionId()]: clientStore1.getConnection().socket}));
        expect(serverStore.getState().get('users')).equal(Map({[User1.id]: User1}));

        expect(clientStore0.getState().get('online')).equal(List());
        expect(clientStore1.getState().get('online')).equal(List.of(User1.toOthers()));
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
      serverStore.clearActions();
      clientStore0.clearActions();

      clientStore0.getClient().disconnect();

      expect(serverStore.getState().get('users')).equal(Map({[User.id]: User}));
      expect(serverStore.getState().get('connections')).equal(Map());

      clientStore0.connect(serverStore);

      expect(serverStore.getState().get('users')).equal(Map({[User.id]: User.set('connectionId', clientStore0.getConnectionId())}));
      expect(serverStore.getState().get('connections')).equal(Map({[clientStore0.getConnectionId()]: clientStore0.getSocket()}));

      setTimeout(() => {
        // Check for login timeout
        expect(serverStore.getState().get('users')).equal(Map({[User.id]: User.set('connectionId', clientStore0.getConnectionId())}));
        expect(serverStore.getState().get('connections')).equal(Map({[clientStore0.getConnectionId()]: clientStore0.getSocket()}));
        done();
      }, 5);
    });

    it('Remembers User from another store', (done) => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);

      clientStore0.dispatch(loginUserRequest('/test', 'testLogin', 'testPassword'));
      const User = UserSpy.lastCall.returnValue;

      //console.log('serverStore', serverStore.clearActions());
      serverStore.clearActions();
      clientStore0.clearActions();

      clientStore0.getClient().disconnect();

      expect(serverStore.getState().get('users')).equal(Map({[User.id]: User}));
      expect(serverStore.getState().get('connections')).equal(Map());

      const clientStore1 = mockClientStore(Map({user: User})).connect(serverStore);

      expect(serverStore.getState().get('users')).equal(Map({[User.id]: User.set('connectionId', clientStore1.getConnectionId())}));
      expect(serverStore.getState().get('connections')).equal(Map({[clientStore1.getConnectionId()]: clientStore1.getSocket()}));

      setTimeout(() => {
        // Check for login timeout
        expect(serverStore.getState().get('users')).equal(Map({[User.id]: User.set('connectionId', clientStore1.getConnectionId())}));
        expect(serverStore.getState().get('connections')).equal(Map({[clientStore1.getConnectionId()]: clientStore1.getSocket()}));
        done();
      }, 5);
    });

    it('Doesnt allow two Users:', (done) => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);

      clientStore0.dispatch(loginUserRequest('/test', 'testLogin', 'testPassword'));
      const User = UserSpy.lastCall.returnValue;

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
      }, 5);
    });

    it('Bug with stealing identity', () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      const clientStore1 = mockClientStore().connect(serverStore);
      clientStore0.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
      const User0 = UserSpy.lastCall.returnValue;
      clientStore1.dispatch(loginUserRequest('/test', 'User1', 'testPassword'));
      const User1 = UserSpy.lastCall.returnValue;
      clientStore1.disconnect();
      clientStore1.connect(serverStore);
      expect(clientStore1.getState().get('user').id).equal(User1.id);
    });
  });
});