import {Map, List, fromJS} from 'immutable';
import {UserModel} from '../models/UserModel';
import {SOCKET_DISCONNECT_NOW, loginUserRequest} from './auth';

//await new Promise(resolve => setTimeout(resolve, 1));

describe('Auth:', function () {
  it('socketConnect / disconnect', () => {
    const serverStore = mockServerStore();
    const clientStore0 = mockClientStore().connect(serverStore);
    expect(serverStore.getState().get('connections')).keys(clientStore0.getSocketId());
    const clientStore1 = mockClientStore().connect(serverStore);
    expect(serverStore.getState().get('connections')).keys(clientStore0.getSocketId(), clientStore1.getSocketId());
    clientStore0.disconnect();
    expect(serverStore.getState().get('connections')).keys(clientStore1.getSocketId());
    clientStore1.disconnect();
    expect(serverStore.getState().get('connections')).size(0);
  });

  describe('loginUserRequest:', () => {
    it('LoginPassword', () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);

      clientStore0.dispatch(loginUserRequest('/test', 'testLogin', 'testPassword'));

      const User0 = serverStore.getState().get('users').last();
      expect(User0).instanceof(UserModel);

      expect(clientStore0.getState().get('user')).equal(User0);
      expect(clientStore0.getState().getIn(['online', User0.id])).equal(User0.toOthers());
    });

    it('LoginPassword not valid', () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);

      expectUnchanged('Login validation', () => {
        clientStore0.dispatch(loginUserRequest('/test', '', 'testPassword'));
      }, serverStore, clientStore0);
    });

    it('Auth dropped from server', () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore(fromJS({
        user: new UserModel({id: '1234', token: 'hehe hehe hehe'})
      })).connect(serverStore);

      clientStore0.dispatch(loginUserRequest('/test'));

      expect(clientStore0.getState().get('user')).null;
    });

    it('User0 connects, User1 connects, User0 logins, User2 connects, User1 logins', () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      const clientStore1 = mockClientStore().connect(serverStore);

      // User0 logins

      clientStore0.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
      const User0 = serverStore.getState().get('users').last();
      expect(User0).instanceof(UserModel);

      //  User2 connects

      const clientStore2 = mockClientStore().connect(serverStore);
      expect(clientStore0.getState().get('user'), 'clientStore0.getState(users)').equal(User0);
      expect(clientStore0.getState().get('online'), 'clientStore0.getState(online)').keys(User0.id);
      expect(clientStore1.getState().get('user'), 'clientStore1.getState(users)').equal(null);
      expect(clientStore1.getState().get('online'), 'clientStore1.getState(online)').equal(Map());
      expect(clientStore2.getState().get('user'), 'clientStore2.getState(users)').equal(null);
      expect(clientStore2.getState().get('online'), 'clientStore2.getState(online)').equal(Map());

      // User1 logins

      clientStore1.dispatch(loginUserRequest('/test', 'User1', 'testPassword'));
      const User1 = serverStore.getState().get('users').last();
      expect(User1).instanceof(UserModel);
      expect(User1).not.equal(User0);

      expect(clientStore0.getState().get('user'), 'clientStore0.getState(users)').equal(User0);
      expect(clientStore0.getState().get('online'), 'clientStore0.getState(online)').keys(User0.id, User1.id);
      expect(clientStore1.getState().get('user'), 'clientStore1.getState(users)').equal(User1);
      expect(clientStore1.getState().get('online'), 'clientStore1.getState(online)').keys(User0.id, User1.id);
      expect(clientStore2.getState().get('user'), 'clientStore2.getState(users)').equal(null);
      expect(clientStore2.getState().get('online'), 'clientStore2.getState(online)').equal(Map());
    });
  });

  describe('Logout:', function () {
    it('Clears after logout', async () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      const clientStore1 = mockClientStore().connect(serverStore);
      clientStore0.dispatch(loginUserRequest('/User0', 'User0', 'User0'));
      const User0 = serverStore.getState().get('users').last();
      clientStore1.dispatch(loginUserRequest('/User1', 'User1', 'User1'));
      const User1 = serverStore.getState().get('users').last();

      clientStore0.disconnect();

      expect(serverStore.getState().get('connections')).keys(clientStore1.getSocketId());
      expect(serverStore.getState().get('users')).keys(User0.id, User1.id);

      await new Promise(resolve => setTimeout(resolve, 1));

      expect(serverStore.getState().get('connections')).keys(clientStore1.getSocketId());
      expect(serverStore.getState().get('users')).keys(User1.id);

      expect(clientStore0.getState().get('online')).keys(User0.id, User1.id);
      expect(clientStore1.getState().get('online')).keys(User1.id);
    });
  });

  describe('LocalStorage:', () => {
    it('Remembers User', async () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      const clientStore1 = mockClientStore().connect(serverStore);

      clientStore0.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
      const User0 = serverStore.getState().get('users').last();
      clientStore1.dispatch(loginUserRequest('/test', 'User1', 'testPassword'));
      const User1 = serverStore.getState().get('users').last();

      clientStore0.disconnect();
      expect(serverStore.getState().get('connections'), 'server.connections').keys(clientStore1.getSocketId());
      expect(serverStore.getState().get('users'), 'server.users').keys(User0.id, User1.id);
      expect(clientStore0.getState().get('online'), 'client0.online').keys(User0.id, User1.id);
      expect(clientStore1.getState().get('online'), 'client1.online').keys(User0.id, User1.id);

      clientStore0.connect(serverStore);

      expect(serverStore.getState().get('connections')).keys(clientStore0.getSocketId(), clientStore1.getSocketId());
      expect(serverStore.getState().get('users')).keys(User0.id, User1.id);
      expect(clientStore0.getState().get('online')).keys(User0.id, User1.id);
      expect(clientStore1.getState().get('online')).keys(User0.id, User1.id);

      await new Promise(resolve => setTimeout(resolve, 2));

      expect(serverStore.getState().get('connections')).keys(clientStore0.getSocketId(), clientStore1.getSocketId());
      expect(serverStore.getState().get('users')).keys(User0.id, User1.id);
      expect(clientStore0.getState().get('online')).keys(User0.id, User1.id);
      expect(clientStore1.getState().get('online')).keys(User0.id, User1.id);
    });

    it('Remembers User from another store', async () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);

      clientStore0.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
      const User0 = serverStore.getState().get('users').last();

      clientStore0.getClient().disconnect();

      const clientStore1 = mockClientStore(Map({user: User0})).connect(serverStore);

      expect(serverStore.getState().get('connections')).keys(clientStore1.getSocketId());
      expect(serverStore.getState().get('users')).keys(User0.id);

      await new Promise(resolve => setTimeout(resolve, 1));

      expect(serverStore.getState().get('connections')).keys(clientStore1.getSocketId());
      expect(serverStore.getState().get('users')).keys(User0.id);
    });

    it(`Doesn't allow two Users:`, async () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);

      clientStore0.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
      const User0 = serverStore.getState().get('users').last();

      const clientStore1 = mockClientStore(Map({user: User0})).connect(serverStore);

      expect(serverStore.getState().get('connections')).keys(clientStore0.getSocketId(), clientStore1.getSocketId());
      expect(serverStore.getState().get('users')).size(1);
      expect(serverStore.getState().getIn(['users', User0.id])).equal(User0);
    });

    it('Bug with stealing identity', () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      const clientStore1 = mockClientStore().connect(serverStore);
      clientStore0.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
      const User0 = serverStore.getState().get('users').last();
      clientStore1.dispatch(loginUserRequest('/test', 'User1', 'testPassword'));
      const User1 = serverStore.getState().get('users').last();
      clientStore1.disconnect();
      clientStore1.connect(serverStore);
      expect(clientStore1.getState().get('user').id).equal(User1.id);
    });
  });
});