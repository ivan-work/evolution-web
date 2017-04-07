import {Map, fromJS} from 'immutable';
import {UserRecord} from '../models/User';
import {authServerToClient, authClientToServer, socketConnect, socketDisconnect, loginUserRequest, loginUserSuccess, loginUserFailure} from './auth';

describe('Auth testing', () => {
  it('socketConnect', () => {
    const serverStore = mockServerStore(Map());
    serverStore.dispatch(socketConnect('1', 'socket'));
    expect(serverStore.getActions()).eql([{
      type: 'socketConnect',
      data: {connectionId: '1', socket: 'socket'}
    }]);
    expect(serverStore.getState()).equal(fromJS({connections: {'1': 'socket'}, users: {}}));
  });

  it('socketDisconnect', () => {
    const serverStore = mockServerStore(fromJS({
      connections: {
        '0': 'socket', '1': 'socket'
      }
      , users: {
        '0': new UserRecord({id: '0', connectionId: '0'})
        , '1': new UserRecord({id: '1', connectionId: '1'})
      }
    }));

    serverStore.dispatch(socketDisconnect('1'));

    expect(serverStore.getActions(), 'serverStore.getActions()').eql([
      {type: 'logoutUser', data: '1', meta: {clients: true}}
      , {type: 'socketDisconnect', data: {connectionId: '1'}}
    ]);

    expect(serverStore.getState()).equal(fromJS({
      connections: {'0': 'socket'}
      , users: {'0': new UserRecord({id: '0', connectionId: '0'})}
    }));
  });

  describe('loginUserRequest', () => {
    it('valid Connection, single User', () => {
      const CONNECTION_ID = '3';
      const User0 = new UserRecord({id: '0', login: 'testLogin', connectionId: CONNECTION_ID});
      const serverStore = mockServerStore(fromJS({
        'users': {}
        , connections: {}
      }));

      const clientStore = mockClientStore(void 0, serverStore, CONNECTION_ID);

      const cs1 = () => clientStore;

      serverStore.dispatch(socketConnect(CONNECTION_ID, cs1));
      serverStore.clearActions();

      clientStore.dispatch(loginUserRequest('/test', User0.login, 'testPassword'));

      //console.log('serverStore');
      //console.log('---');
      //console.log('state', serverStore.getState().toJS());
      //console.log('---');
      //console.log('actions', serverStore.getActions());
      //console.log('---');
      //console.log('clientStore');
      //console.log('---');
      //console.log('state', clientStore.getState().toJS());
      //console.log('---');
      //console.log('actions', clientStore.getActions());
      //console.log('---');

      expect(serverStore.getState()).equal(fromJS({
        users: {'0': User0},
        connections: {'3': cs1}
      }));

      expect(clientStore.getState()).equal(fromJS({
        users: {
          token: null,
          user: User0.toSecure(),
          isAuthenticated: true,
          isAuthenticating: false,
          statusText: 'You have been successfully logged in.'
        }
      }));

      expect(serverStore.getActions()).eql([{
        type: 'onlineJoin',
        data: {user: User0.toSecure()},
        meta: {clients: true}
      }, {
        type: 'loginUserSuccess',
        data: {
          user: User0,
          redirect: '/test'
        },
        meta: {connectionId: '3'}
      }, {
        type: 'onlineSet',
        data: {users: [User0.toSecure()]},
        meta: {connectionId: '3'}
      }]);

      expect(clientStore.getActions()).eql([{
        type: 'loginUserRequest',
        data: {
          redirect: '/test',
          login: 'testLogin',
          password: 'testPassword'
        },
        meta: {server: true}
      }, {
        type: 'onlineJoin', data: {user: User0.toSecure()}
      }, {
        type: 'loginUserSuccess',
        data: {user: User0}
      }, {
        type: '@@router/CALL_HISTORY_METHOD',
        payload: {method: 'push', args: ['/test']}
      }, {
        type: 'onlineSet', data: {users: [User0.toSecure()]}
      }]);
    });
    //it('invalid Connection, single User', () => {
    //  const CONNECTION_ID = 3;
    //  const store = mockStore(fromJS({
    //    'users': {}
    //    , connections: {}
    //  }));
    //
    //  store.dispatch(addSocketId(CONNECTION_ID, loginUserRequest('/test', 'testLogin', 'testPassword')));
    //
    //  expect(store.getActions()).eql([{
    //    type: 'loginUserRequest',
    //    data: {
    //      redirect: '/test',
    //      login: 'testLogin',
    //      password: 'testPassword'
    //    },
    //    meta: {server: true, TEST_SOCKET_ID: 3}
    //  }, {
    //    type: 'loginUserFailure',
    //    data: 'Connection is missing',
    //    meta: {connectionId: 3}
    //  }, {type: 'loginUserFailure', data: 'Connection is missing'}]);
    //});
  });
});