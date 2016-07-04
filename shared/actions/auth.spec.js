import {Map, List, fromJS} from 'immutable';
import {UserRecord} from '../models/User';
import {authServerToClient, authClientToServer, socketConnect, socketDisconnect, loginUserRequest, loginUserSuccess, loginUserFailure} from './auth';

describe('Auth testing', function () {
  it('socketConnect', () => {
    const serverStore = mockServerStore();
    const clientStore = mockClientStore().connect(serverStore);
    expect(serverStore.getActions(), 'serverStore.getActions()').eql([{
      type: 'socketConnect',
      data: clientStore.getConnection()
    }]);
    expect(serverStore.getState(), 'serverStore.getState()').equal(fromJS({
      connections: {[clientStore.getConnectionId()]: clientStore.getSocket()},
      users: {}
    }));
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

    expect(serverStore.getState()).equal(fromJS({
      connections: {}
      , users: {}
    }));
  });

  describe('loginUserRequest', () => {
    it('valid Connection, single User', () => {
      const serverStore = mockServerStore();
      const clientStore = mockClientStore().connect(serverStore);
      const User0 = new UserRecord({id: '0', login: 'testLogin', connectionId: clientStore.getConnectionId()});
      serverStore.clearActions();

      clientStore.dispatch(loginUserRequest('/test', User0.login, 'testPassword'));

      //console.log('-----');
      //console.log('clientStore:');
      //console.log(clientStore.getState().toJS());
      //console.log(clientStore.getActions());
      //
      //console.log('-----');
      //console.log('serverStore:');
      //console.log(serverStore.getState().toJS());
      //console.log(serverStore.getActions());

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
        type: 'onlineJoin', data: {user: User0.toSecure()}
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
        type: 'onlineSet', data: {users: List.of(User0.toSecure())}
      });
      expect(clientStore.getActions()[5]).undefined;

      expect(serverStore.getActions().length, 'serverStore.getActions().length').equal(3);
      expect(serverStore.getActions()[0], 'serverStore.getActions()[0]').eql({
        type: 'onlineJoin',
        data: {user: User0.toSecure()},
        meta: {clients: true}
      });
      expect(serverStore.getActions()[1], 'serverStore.getActions()[1]').eql({
        type: 'loginUserSuccess',
        data: {
          user: User0,
          redirect: '/test'
        },
        meta: {connectionId: clientStore.getConnectionId()}
      });
      expect(serverStore.getActions()[2], 'serverStore.getActions()[2]').eql({
        type: 'onlineSet',
        data: {users: [User0.toSecure()]},
        meta: {connectionId: clientStore.getConnectionId()}
      });

      expect(serverStore.getState()).equal(fromJS({
        connections: {[clientStore.getConnectionId()]: clientStore.getConnection().socket}
        , users: {'0': User0}
      }));

      expect(clientStore.getState().get('users')).equal(fromJS({
        token: null,
        user: User0.toSecure(),
        isAuthenticated: true,
        isAuthenticating: false,
        statusText: 'You have been successfully logged in.'
      }));
      expect(clientStore.getState().get('online')).equal(List([User0.toSecure()]));
    });

    it('valid Connection, two Users', () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      const clientStore1 = mockClientStore().connect(serverStore);
      const User0 = new UserRecord({id: '1', login: 'User0', connectionId: clientStore0.getConnectionId()});
      const User1 = new UserRecord({id: '2', login: 'User1', connectionId: clientStore1.getConnectionId()});
      serverStore.clearActions();

      clientStore0.dispatch(loginUserRequest('/test', User0.login, 'testPassword'));

      expect(serverStore.getState(), 'serverStore.getState()').equal(fromJS({
        connections: {
          [clientStore0.getConnectionId()]: clientStore0.getConnection().socket
          , [clientStore1.getConnectionId()]: clientStore1.getConnection().socket
        }
        , users: {'1': User0}
      }));

      expect(clientStore0.getState().get('users'), 'clientStore0.getState(users)').equal(fromJS({
        token: null,
        user: User0.toSecure(),
        isAuthenticated: true,
        isAuthenticating: false,
        statusText: 'You have been successfully logged in.'
      }));
      expect(clientStore0.getState().get('online'), 'clientStore0.getState(online)')
        .equal(List([User0.toSecure()]));

      expect(clientStore1.getState().get('users'), 'clientStore1.getState(users)').equal(fromJS({
        token: null,
        user: null,
        isAuthenticated: false,
        isAuthenticating: false,
        statusText: null
      }));
      expect(clientStore1.getState().get('online'), 'clientStore1.getState(online)')
        .equal(List([User0.toSecure()]));

      clientStore1.dispatch(loginUserRequest('/test', User1.login, 'testPassword'));

      expect(clientStore0.getState().get('users'), 'clientStore0.getState(users)').equal(fromJS({
        token: null,
        user: User0.toSecure(),
        isAuthenticated: true,
        isAuthenticating: false,
        statusText: 'You have been successfully logged in.'
      }));
      expect(clientStore0.getState().get('online'), 'clientStore0.getState(online)')
        .equal(List([User0.toSecure(), User1.toSecure()]));

      expect(clientStore1.getState().get('users'), 'clientStore1.getState(users)').equal(fromJS({
        token: null,
        user: User1.toSecure(),
        isAuthenticated: true,
        isAuthenticating: false,
        statusText: 'You have been successfully logged in.'
      }));
      expect(clientStore1.getState().get('online'), 'clientStore1.getState(online)')
        .equal(List.of(User0.toSecure(), User1.toSecure()));
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
      expect(serverStore.getActions()[1]).eql({type: 'logoutUser', data: '3', meta: {clients: true}});
      expect(serverStore.getActions()[2]).eql({type: 'socketDisconnect', data: {connectionId: clientStore1.getConnectionId()}});
    })
  });
});