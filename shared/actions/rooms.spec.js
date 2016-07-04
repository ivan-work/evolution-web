import {Map, List, fromJS} from 'immutable';
import {UserRecord} from '../models/User';
import {loginUserRequest} from '../actions/actions';

describe('Rooms:', function () {
  it('Create:', () => {
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
  });
});