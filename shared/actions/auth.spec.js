import {Map, List, fromJS} from 'immutable';
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

var sandbox;
var UserSpy;

describe('Auth testing', function () {
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

  describe('loginUserRequest', () => {
    it('valid Connection, single User', () => {
      const serverStore = mockServerStore();
      const clientStore = mockClientStore().connect(serverStore);

      serverStore.clearActions();
      clientStore.dispatch(loginUserRequest('/test', 'testLogin', 'testPassword'));
      const User0 = UserSpy.lastCall.returnValue;

      /*
       * Client Actions
       * */
      expect(clientStore.getActions().length, 'clientStore.getActions().length').equal(5);

      expect(clientStore.getActionType(0), 'clientStore.getActionType(0)').eql('loginUserRequest');

      expect(clientStore.getActionType(1), 'clientStore.getActionType(1)').eql('onlineJoin');
      expect(clientStore.getActionData(1), 'clientStore.getActionData(1)').eql({user: User0.toOthers()});

      expect(clientStore.getActionType(2), 'clientStore.getActionType(2)').eql('loginUserSuccess');
      expect(clientStore.getActionData(2), 'clientStore.getActionData(2)').eql({user: User0});

      expect(clientStore.getActionType(3), 'clientStore.getActionType(3)').eql('@@router/CALL_HISTORY_METHOD');
      expect(clientStore.getAction(3).payload, 'clientStore.getAction(3).payload').eql({
        method: 'push',
        args: ['/test']
      });

      expect(clientStore.getActionType(4), 'clientStore.getActionType(4)').eql('onlineSet');
      expect(clientStore.getActionData(4), 'clientStore.getActionData(4)').eql({users: List.of(User0.toOthers())});

      /*
       * Server Actions
       * */
      expect(serverStore.getActions().length, 'serverStore.getActions().length').equal(3);

      expect(serverStore.getActionType(0), 'serverStore.getActionType(0)').eql('onlineJoin');
      expect(serverStore.getActionData(0), 'serverStore.getActionData(0)').eql({user: User0.toOthers()});

      expect(serverStore.getActionType(1), 'serverStore.getActionType(1)').eql('loginUserSuccess');
      expect(serverStore.getActionData(1), 'serverStore.getActionData(1)').eql({user: User0, redirect: '/test'});

      expect(serverStore.getActionType(2), 'serverStore.getActionType(2)').eql('onlineSet');
      expect(serverStore.getActionData(2), 'serverStore.getActionData(2)').eql({users: [User0.toOthers()]});

      /*
       * States
       * */
      expect(clientStore.getState().get('users')).equal(fromJS({
        token: null,
        user: User0,
        isAuthenticated: true,
        isAuthenticating: false,
        statusText: 'You have been successfully logged in.'
      }));

      expect(serverStore.getState().get('connections')).equal(Map({[clientStore.getConnectionId()]: clientStore.getConnection().socket}));
      expect(serverStore.getState().get('users')).equal(Map({[User0.id]: User0}));
      expect(clientStore.getState().get('online')).equal(List([User0.toOthers()]));
    });

    it('valid Connection, two Users', () => {
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

      expect(clientStore0.getState().get('users'), 'clientStore0.getState(users)').equal(fromJS({
        token: null,
        user: User0,
        isAuthenticated: true,
        isAuthenticating: false,
        statusText: 'You have been successfully logged in.'
      }));
      expect(clientStore0.getState().get('online'), 'clientStore0.getState(online)')
        .equal(List([User0.toOthers()]));

      /*
       * User1 is not logged in, but online is here
       * */

      expect(clientStore1.getState().get('users'), 'clientStore1.getState(users)').equal(fromJS({
        token: null,
        user: null,
        isAuthenticated: false,
        isAuthenticating: false,
        statusText: null
      }));
      expect(clientStore1.getState().get('online'), 'clientStore1.getState(online)')
        .equal(List([User0.toOthers()]));

      /*
       * User1 connects
       * */

      clientStore1.dispatch(loginUserRequest('/test', 'User1', 'testPassword'));
      const User1 = UserSpy.lastCall.returnValue;


      expect(clientStore0.getState().get('users'), 'clientStore0.getState(users)').equal(fromJS({
        token: null,
        user: User0,
        isAuthenticated: true,
        isAuthenticating: false,
        statusText: 'You have been successfully logged in.'
      }));
      expect(clientStore0.getState().get('online'), 'clientStore0.getState(online)')
        .equal(List([User0.toOthers(), User1.toOthers()]));

      expect(clientStore1.getState().get('users'), 'clientStore1.getState(users)').equal(fromJS({
        token: null,
        user: User1,
        isAuthenticated: true,
        isAuthenticating: false,
        statusText: 'You have been successfully logged in.'
      }));
      expect(clientStore1.getState().get('online'), 'clientStore1.getState(online)')
        .equal(List.of(User0.toOthers(), User1.toOthers()));
    });
  });
  describe('disconnecting', function () {
    it('clears everything', () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      const clientStore1 = mockClientStore().connect(serverStore);
      clientStore0.dispatch(loginUserRequest('/test', 'testLogin', 'testPassword'));
      const User0 = UserSpy.lastCall.returnValue;
      serverStore.clearActions();

      clientStore0.getClient().disconnect();
      clientStore1.getClient().disconnect();

      expect(serverStore.getState().get('connections')).equal(Map());
      expect(serverStore.getState().get('users')).equal(Map());

      expect(serverStore.getActions()[0]).eql({
        type: 'socketDisconnect',
        data: {connectionId: clientStore0.getConnectionId()}
      });
      expect(serverStore.getActions()[1]).eql({
        type: 'logoutUser',
        data: User0.id,
        meta: {clients: true}
      });
      expect(serverStore.getActions()[2]).eql({
        type: 'socketDisconnect',
        data: {connectionId: clientStore1.getConnectionId()}
      });
    });
  });
});