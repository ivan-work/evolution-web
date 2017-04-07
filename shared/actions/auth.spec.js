import test from 'tape';

import {Map, fromJS} from 'immutable';
import {UserRecord} from '../models/User';
import {authServerToClient, authClientToServer, socketConnect, socketDisconnect, loginUserRequest, loginUserSuccess, loginUserFailure} from './auth';

test('Auth testing', (assert) => {
  assert.test('socketConnect', () => {

  });
  assert.test('socketDisconnect', () => {
    const store = mockStore(fromJS({
      users: {
        0: new UserRecord({id: 0, connectionId: '0'})
        , 1: new UserRecord({id: 1, connectionId: '1'})
      }
    }));
  //  store.dispatch(socketDisconnect('1'));git 
  //  expect(store.getActions()).eql([
  //    {type: 'logoutUser', data: 1}
  //    , {type: 'socketDisconnect', data: {connectionId: '1'}}
  //  ]);
  });
  //describe('loginUserRequest', () => {
  //  it('clientSide', () => {
  //  });
  //  describe('serverSide', () => {
  //    //it('empty Users, empty Connections', () => {
  //    //
  //    //});
  //    it('valid Connection, single User', () => {
  //      const CONNECTION_ID = '3';
  //      const store = mockStore(fromJS({
  //        'users': {}
  //        , connections: {[CONNECTION_ID]: '<socket>'}
  //      }));
  //
  //      store.dispatch(addSocketId(CONNECTION_ID, loginUserRequest('/test', 'testLogin', 'testPassword')));
  //
  //      const actions = store.getActions();
  //      expect(store.getActions()).eql([{
  //        type: 'loginUserRequest'
  //        , data: {
  //          redirect: '/test'
  //          , login: 'testLogin'
  //          , password: 'testPassword'
  //        }
  //        , meta: {server: true, TEST_SOCKET_ID: CONNECTION_ID}
  //      }, {
  //        type: 'loginUserSuccess'
  //        , data: {
  //          user: {id: actions[1].data.user.id, login: 'testLogin', connectionId: CONNECTION_ID}
  //          , redirect: '/test'
  //        }
  //        , meta: {
  //          connectionId: CONNECTION_ID
  //        }
  //      }]);
  //    });
  //    it('invalid Connection, single User', () => {
  //      const CONNECTION_ID = 3;
  //      const store = mockStore(fromJS({
  //        'users': {}
  //        , connections: {}
  //      }));
  //
  //      store.dispatch(addSocketId(CONNECTION_ID, loginUserRequest('/test', 'testLogin', 'testPassword')));
  //
  //      expect(store.getActions()[1].type).equal('loginUserFailure');
  //    });
  //    //const store = mockStore(fromJS({
  //    //  'users': {}
  //    //}));
  //    //
  //    ////clientRequest = loginUserRequest('/test', 'testLogin', 'testPassword');
  //    //
  //    ////authClientToServer.loginUserRequest(1, clientRequest.data);
  //    //
  //    ////store.dispatch(socketOf('loginUserRequest', authClientToServer, 1)('/test', 'testLogin', 'testPassword'));
  //    //
  //    //
  //    //console.log(store.getActions());
  //  });
  //});
});