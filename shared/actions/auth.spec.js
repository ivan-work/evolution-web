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

describe('Auth testing', function () {
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
      const User0 = new UserModel({id: clientStore.getConnectionId(), login: 'testLogin', connectionId: clientStore.getConnectionId()})
        .sign();
      serverStore.clearActions();

      clientStore.dispatch(loginUserRequest('/test', User0.login, 'testPassword'));

      /*
      * Client Actions
      * */
      expect(clientStore.getActions()[0], 'clientStore.getActions()[0]').eql({
        type: 'loginUserRequest',
        data: {
          redirect: '/test',
          login: 'testLogin',
          password: 'testPassword'
        },
        meta: {server: true}
      });
      expect(clientStore.getActions()[1], 'clientStore.getActions()[1]').eql({
        type: 'onlineJoin', data: {user: User0.toOthers()}
      });
      expect(clientStore.getActions()[2], 'clientStore.getActions()[2]').eql({
        type: 'loginUserSuccess',
        data: {user: User0}
      });
      expect(clientStore.getActions()[3], 'clientStore.getActions()[3]').eql({
        type: '@@router/CALL_HISTORY_METHOD',
        payload: {method: 'push', args: ['/test']}
      });
      expect(clientStore.getActions()[4], 'clientStore.getActions()[4]').eql({
        type: 'onlineSet', data: {users: List.of(User0.toOthers())}
      });
      expect(clientStore.getActions()[5]).undefined;

      /*
       * Server Actions
       * */
      expect(serverStore.getActions().length, 'serverStore.getActions().length').equal(3);
      expect(serverStore.getActions()[0], 'serverStore.getActions()[0]').eql({
        type: 'onlineJoin',
        data: {user: User0.toOthers()},
        meta: {clients: true}
      });
      expect(serverStore.getActions()[1], 'serverStore.getActions()[1]').eql({
        type: 'loginUserSuccess',
        data: {
          user: User0,
          redirect: '/test'
        },
        meta: {clients: [clientStore.getConnectionId()]}
      });
      expect(serverStore.getActions()[2], 'serverStore.getActions()[2]').eql({
        type: 'onlineSet',
        data: {users: [User0.toOthers()]},
        meta: {clients: [clientStore.getConnectionId()]}
      });

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
      expect(clientStore.getState().get('online')).equal(List([User0.toOthers()]));

      expect(serverStore.getState().get('connections')).equal(Map({[clientStore.getConnectionId()]: clientStore.getConnection().socket}));
      expect(serverStore.getState().get('users')).equal(Map({[clientStore.getConnectionId()]: User0}));
    });

    it('valid Connection, two Users', () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      const clientStore1 = mockClientStore().connect(serverStore);
      const User0 = new UserModel({id: clientStore0.getConnectionId(), login: 'User0', connectionId: clientStore0.getConnectionId()})
        .sign();
      const User1 = new UserModel({id: clientStore1.getConnectionId(), login: 'User1', connectionId: clientStore1.getConnectionId()})
        .sign();
      serverStore.clearActions();

      clientStore0.dispatch(loginUserRequest('/test', User0.login, 'testPassword'));

      expect(serverStore.getState().get('connections')).equal(Map({
        [clientStore0.getConnectionId()]: clientStore0.getConnection().socket
        , [clientStore1.getConnectionId()]: clientStore1.getConnection().socket
      }));
      expect(serverStore.getState().get('users')).equal(Map({[clientStore0.getConnectionId()]: User0}));

      expect(clientStore0.getState().get('users'), 'clientStore0.getState(users)').equal(fromJS({
        token: null,
        user: User0,
        isAuthenticated: true,
        isAuthenticating: false,
        statusText: 'You have been successfully logged in.'
      }));
      expect(clientStore0.getState().get('online'), 'clientStore0.getState(online)')
        .equal(List([User0.toOthers()]));

      expect(clientStore1.getState().get('users'), 'clientStore1.getState(users)').equal(fromJS({
        token: null,
        user: null,
        isAuthenticated: false,
        isAuthenticating: false,
        statusText: null
      }));
      expect(clientStore1.getState().get('online'), 'clientStore1.getState(online)')
        .equal(List([User0.toOthers()]));

      clientStore1.dispatch(loginUserRequest('/test', User1.login, 'testPassword'));

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
      serverStore.clearActions();

      clientStore0.getClient().disconnect();
      clientStore1.getClient().disconnect();

      expect(serverStore.getState().get('connections')).equal(Map());
      expect(serverStore.getState().get('users')).equal(Map());

      expect(serverStore.getActions()[0]).eql({type: 'socketDisconnect', data: {connectionId: clientStore0.getConnectionId()}});
      expect(serverStore.getActions()[1]).eql({type: 'logoutUser', data: clientStore0.getConnectionId(), meta: {clients: true}});
      expect(serverStore.getActions()[2]).eql({type: 'socketDisconnect', data: {connectionId: clientStore1.getConnectionId()}});
    })
  });
});