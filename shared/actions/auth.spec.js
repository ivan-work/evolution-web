import {Map, List, fromJS} from 'immutable';
import {UserRecord} from '../models/User';
import {authServerToClient, authClientToServer, socketConnect, socketDisconnect, loginUserRequest, loginUserSuccess, loginUserFailure} from './auth';

describe('Auth testing', function () {
  it('socketConnect', () => {
    const serverStore = mockServerStore();
    const clientStore = serverStore.spawnClient();
    console.log(serverStore.getState().toJS());
    console.log(serverStore.getActions());
    expect(serverStore.getActions()).eql([{
      type: 'socketConnect',
      data: clientStore.getConnection()
    }]);
    expect(serverStore.getState()).equal(fromJS({
      connections: {[clientStore.getConnection().connectionId]: clientStore.getConnection().socket},
      users: {}
    }));
  });

//  it('socketDisconnect', () => {
//    const serverStore = mockServerStore(fromJS({
//      connections: {
//        '0': 'socket', '1': 'socket'
//      }
//      , users: {
//        '0': new UserRecord({id: '0', connectionId: '0'})
//        , '1': new UserRecord({id: '1', connectionId: '1'})
//      }
//    }));
//
//    serverStore.dispatch(socketDisconnect('1'));
//
//    expect(serverStore.getActions(), 'serverStore.getActions()').eql([
//      {type: 'logoutUser', data: '1', meta: {clients: true}}
//      , {type: 'socketDisconnect', data: {connectionId: '1'}}
//    ]);
//
//    expect(serverStore.getState()).equal(fromJS({
//      connections: {'0': 'socket'}
//      , users: {'0': new UserRecord({id: '0', connectionId: '0'})}
//    }));
//  });
//
//  describe('loginUserRequest', () => {
//    it('valid Connection, single User', () => {
//      const CONNECTION_ID = '3';
//      const User0 = new UserRecord({id: '0', login: 'testLogin', connectionId: CONNECTION_ID});
//
//      const serverStore = mockServerStore();
//      const clientStore = mockClientStore(void 0, serverStore, CONNECTION_ID);
//      const cs1 = () => clientStore;
//
//      serverStore.dispatch(socketConnect(CONNECTION_ID, cs1));
//      serverStore.clearActions();
//
//      clientStore.dispatch(loginUserRequest('/test', User0.login, 'testPassword'));
//
//      //console.log('serverStore');
//      //console.log('---');
//      //console.log('state', serverStore.getState().toJS());
//      //console.log('---');
//      //console.log('actions', serverStore.getActions());
//      //console.log('---');
//      //console.log('clientStore');
//      //console.log('---');
//      //console.log('state', clientStore.getState().toJS());
//      //console.log('---');
//      //console.log('actions', clientStore.getActions());
//      //console.log('---');
//
//      expect(serverStore.getState()).equal(fromJS({
//        users: {'0': User0},
//        connections: {'3': cs1}
//      }));
//
//      expect(clientStore.getState().get('users')).equal(fromJS({
//        token: null,
//        user: User0.toSecure(),
//        isAuthenticated: true,
//        isAuthenticating: false,
//        statusText: 'You have been successfully logged in.'
//      }));
//      expect(clientStore.getState().get('online')).equal(List([User0.toSecure()]));
//
//      expect(serverStore.getActions().length).equal(3);
//      expect(serverStore.getActions()[0], 'serverStore.getActions()[0]').eql({
//        type: 'onlineJoin',
//        data: {user: User0.toSecure()},
//        meta: {clients: true}
//      });
//      expect(serverStore.getActions()[1], 'serverStore.getActions()[1]').eql({
//        type: 'loginUserSuccess',
//        data: {
//          user: User0,
//          redirect: '/test'
//        },
//        meta: {connectionId: '3'}
//      });
//      expect(serverStore.getActions()[2], 'serverStore.getActions()[2]').eql({
//        type: 'onlineSet',
//        data: {users: [User0.toSecure()]},
//        meta: {connectionId: '3'}
//      });
//
//      expect(clientStore.getActions()[0], 'clientStore.getActions()[0]').eql({
//        type: 'loginUserRequest',
//        data: {
//          redirect: '/test',
//          login: 'testLogin',
//          password: 'testPassword'
//        },
//        meta: {server: true}
//      });
//      expect(clientStore.getActions()[1], 'clientStore.getActions()[1]').eql({
//        type: 'onlineJoin', data: {user: User0.toSecure()}
//      });
//      expect(clientStore.getActions()[2], 'clientStore.getActions()[2]').eql({
//        type: 'loginUserSuccess',
//        data: {user: User0}
//      });
//      expect(clientStore.getActions()[3], 'clientStore.getActions()[3]').eql({
//        type: '@@router/CALL_HISTORY_METHOD',
//        payload: {method: 'push', args: ['/test']}
//      });
//      expect(clientStore.getActions()[4], 'clientStore.getActions()[4]').eql({
//        type: 'onlineSet', data: {users: List.of(User0.toSecure())}
//      });
//    });
//
//    it('valid Connection, two Users', () => {
//      const CONNECTION_ID_0 = '0';
//      const CONNECTION_ID_1 = '1';
//      const User0 = new UserRecord({id: '1', login: 'User0', connectionId: CONNECTION_ID_0});
//      const User1 = new UserRecord({id: '2', login: 'User1', connectionId: CONNECTION_ID_1});
//
//      const serverStore = mockServerStore();
//      const clientStore0 = mockClientStore(void 0, serverStore, CONNECTION_ID_0);
//      const clientStore1 = mockClientStore(void 0, serverStore, CONNECTION_ID_1);
//      const cs0 = () => clientStore0;
//      const cs1 = () => clientStore1;
//
//      serverStore.dispatch(socketConnect(CONNECTION_ID_0, cs0));
//      serverStore.dispatch(socketConnect(CONNECTION_ID_1, cs1));
//      serverStore.clearActions();
//
//      clientStore0.dispatch(loginUserRequest('/test', User0.login, 'testPassword'));
//
//      expect(serverStore.getState(), 'serverStore.getState()').equal(fromJS({
//        connections: {'0': cs0, '1': cs1}
//        , users: {'1': User0}
//      }));
//
//      expect(clientStore0.getState().get('users'), 'clientStore0.getState(users)').equal(fromJS({
//        token: null,
//        user: User0.toSecure(),
//        isAuthenticated: true,
//        isAuthenticating: false,
//        statusText: 'You have been successfully logged in.'
//      }));
//      expect(clientStore0.getState().get('online'), 'clientStore0.getState(online)')
//        .equal(List([User0.toSecure()]));
//
//      expect(clientStore1.getState().get('users'), 'clientStore1.getState(users)').equal(fromJS({
//        token: null,
//        user: null,
//        isAuthenticated: false,
//        isAuthenticating: false,
//        statusText: null
//      }));
//      expect(clientStore1.getState().get('online'), 'clientStore1.getState(online)')
//        .equal(List([User0.toSecure()]));
//
//      clientStore1.dispatch(loginUserRequest('/test', User1.login, 'testPassword'));
//
//      expect(clientStore0.getState().get('users'), 'clientStore0.getState(users)').equal(fromJS({
//        token: null,
//        user: User0.toSecure(),
//        isAuthenticated: true,
//        isAuthenticating: false,
//        statusText: 'You have been successfully logged in.'
//      }));
//      expect(clientStore0.getState().get('online'), 'clientStore0.getState(online)')
//        .equal(List([User0.toSecure(), User1.toSecure()]));
//
//      expect(clientStore1.getState().get('users'), 'clientStore1.getState(users)').equal(fromJS({
//        token: null,
//        user: User1.toSecure(),
//        isAuthenticated: true,
//        isAuthenticating: false,
//        statusText: 'You have been successfully logged in.'
//      }));
//      expect(clientStore1.getState().get('online'), 'clientStore1.getState(online)')
//        .equal(List.of(User0.toSecure(), User1.toSecure()));
//    });
//  });
});