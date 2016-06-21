import {Map, fromJS} from 'immutable';
import {UserRecord} from '../models/User';
import {authServerToClient, authClientToServer, socketConnect, socketDisconnect, loginUserRequest, loginUserSuccess, loginUserFailure} from './auth';

describe('Auth testing', () => {
  it('socketConnect', () => {
  });

  it('socketDisconnect', () => {
    const store = mockStore(fromJS({
      users: {
        0: new UserRecord({id: 0, connectionId: '0'})
        , 1: new UserRecord({id: 1, connectionId: '1'})
      }
    }));

    store.dispatch(socketDisconnect('1'));

    expect(store.getActions()).eql([
      {type: 'logoutUser', data: 1, meta: {clients: true}} // server
      , {type: 'logoutUser', data: 1} // clients
      , {type: 'socketDisconnect', data: {connectionId: '1'}}
    ]);
  });

  describe('loginUserRequest', () => {
    it('clientSide', () => {
    });
    describe('serverSide', () => {

      it('valid Connection, single User', () => {
        const CONNECTION_ID = '3';
        const store = mockStore(fromJS({
          'users': {}
          , connections: {[CONNECTION_ID]: '<socket>'}
        }));

        store.dispatch(addSocketId(CONNECTION_ID, loginUserRequest('/test', 'testLogin', 'testPassword')));

        expect(store.getActions()).eql([
          // client > server
          {
            type: 'loginUserRequest'
            , data: {
            redirect: '/test'
            , login: 'testLogin'
            , password: 'testPassword'
          }
            , meta: {server: true, TEST_SOCKET_ID: CONNECTION_ID}
          }
          // server > client
          , {
            type: 'onlineJoin'
            , data: {user: {id: 0, login: 'testLogin', connectionId: CONNECTION_ID}}
            , meta: {clients: true}
          }
          // client
          , {
            type: 'onlineJoin'
            , data: {user: {id: 0, login: 'testLogin', connectionId: CONNECTION_ID}}
          }
          // server > client
          , {
            type: 'loginUserSuccess'
            , data: {
              user: new UserRecord({id: 0, login: 'testLogin', connectionId: CONNECTION_ID})
              , redirect: '/test'
            }
            , meta: {connectionId: CONNECTION_ID}
          }
          // client
          , {
            type: 'loginUserSuccess'
            , data: {
              user: new UserRecord({id: 0, login: 'testLogin', connectionId: CONNECTION_ID})
            }
          }
          // client
          , {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: {
              method: 'push',
              args: ['/test']
            }
          }
          // server > client
          , {
            type: 'onlineSet'
            , data: {users: []}
            , meta: {connectionId: CONNECTION_ID}
          }
          // client
          , {
            type: 'onlineSet'
            , data: {users: []}
          }]);
      });

      it('invalid Connection, single User', () => {
        const CONNECTION_ID = 3;
        const store = mockStore(fromJS({
          'users': {}
          , connections: {}
        }));

        store.dispatch(addSocketId(CONNECTION_ID, loginUserRequest('/test', 'testLogin', 'testPassword')));

        expect(store.getActions()).eql([{
          type: 'loginUserRequest',
          data: {
            redirect: '/test',
            login: 'testLogin',
            password: 'testPassword'
          },
          meta: {server: true, TEST_SOCKET_ID: 3}
        }, {
          type: 'loginUserFailure',
          data: 'Connection is missing',
          meta: {connectionId: 3}
        }, {type: 'loginUserFailure', data: 'Connection is missing'}]);
      });
    });
  });
});