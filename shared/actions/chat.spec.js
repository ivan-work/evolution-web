import {Map, List, fromJS} from 'immutable';
import {UserModel} from '../models/UserModel';
import {RoomModel} from '../models/RoomModel';
import {
  loginUserFormRequest
  , roomCreateRequest
  , roomJoinRequest
  , roomExitRequest
  , chatMessageRequest
} from '../actions/actions';
import {selectRoom} from '../selectors';

describe('Chat:', () => {
  it('Global:', () => {
    const serverStore = mockServerStore();
    const clientStore0 = mockClientStore().connect(serverStore);
    const clientStore1 = mockClientStore().connect(serverStore);
    expectUnchanged(`Not logged in can't chat`, () =>
        clientStore0.dispatch(chatMessageRequest(null, 'GLOBAL', 'test0'))
      , serverStore, clientStore0, clientStore1);
    clientStore0.dispatch(loginUserFormRequest('/test', {id: 'test', login: 'User0'}));
    clientStore0.dispatch(chatMessageRequest(null, 'GLOBAL', 'test1'));
    expect(serverStore.getState().getIn(['chat', 'messages'])).size(1);
    expect(serverStore.getState().getIn(['chat', 'messages', 0, 'text'])).equal('test1');
    expect(clientStore0.getState().getIn(['chat', 'messages', 0, 'text'])).equal('test1');
    expect(clientStore1.getState().getIn(['chat', 'messages', 0, 'text'])).undefined;
    clientStore1.dispatch(loginUserFormRequest('/test', {id: 'test', login: 'User1'}));
    expect(clientStore1.getState().getIn(['chat', 'messages', 0, 'text'])).equal('test1');

    clientStore0.dispatch(chatMessageRequest(null, 'GLOBAL', 'test2'));
    expect(serverStore.getState().getIn(['chat', 'messages', 1, 'text'])).equal('test2');
    expect(clientStore0.getState().getIn(['chat', 'messages', 1, 'text'])).equal('test2');
    expect(clientStore1.getState().getIn(['chat', 'messages', 1, 'text'])).equal('test2');
  });

  it('Room:', () => {
    const [serverStore
      , {clientStore0, User0}
      , {clientStore1, User1}
      ] = mockStores(2);
    const clientStore2 = mockClientStore().connect(serverStore);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;

    expectUnchanged(`Id can't be null`, () =>
        clientStore0.dispatch(chatMessageRequest(null, 'ROOM', 'test0'))
      , serverStore, clientStore0, clientStore1);
    clientStore0.dispatch(chatMessageRequest(roomId, 'ROOM', 'test1'));

    expect(serverStore.getState().getIn(['chat', 'messages'])).size(0);
    expect(serverStore.getState().getIn(['rooms', roomId, 'chat', 'messages'])).size(1);
    expect(serverStore.getState().getIn(['rooms', roomId, 'chat', 'messages', 0, 'text'])).equal('test1');
    expect(clientStore0.getState().getIn(['rooms', roomId, 'chat', 'messages', 0, 'text'])).equal('test1');
    expect(clientStore1.getState().getIn(['rooms', roomId, 'chat', 'messages', 0, 'text'])).undefined;
    expect(clientStore2.getState().getIn(['rooms', roomId, 'chat', 'messages', 0, 'text'])).undefined;

    clientStore1.dispatch(roomJoinRequest(roomId));
    expect(clientStore1.getState().getIn(['rooms', roomId, 'chat', 'messages', 0, 'text'])).equal('test1');

    clientStore1.dispatch(chatMessageRequest(roomId, 'ROOM', 'test2'));
    expect(serverStore.getState().getIn(['rooms', roomId, 'chat', 'messages', 1, 'text'])).equal('test2');
    expect(clientStore0.getState().getIn(['rooms', roomId, 'chat', 'messages', 1, 'text'])).equal('test2');
    expect(clientStore1.getState().getIn(['rooms', roomId, 'chat', 'messages', 1, 'text'])).equal('test2');
    expect(clientStore2.getState().getIn(['rooms', roomId, 'chat', 'messages', 1, 'text'])).undefined;

    clientStore2.dispatch(loginUserFormRequest('/test', {id: 'test', login: 'User2'}));
    clientStore2.dispatch(roomJoinRequest(roomId));
    expect(clientStore2.getState().getIn(['rooms', roomId, 'chat', 'messages', 0, 'text'])).equal('test1');
    expect(clientStore2.getState().getIn(['rooms', roomId, 'chat', 'messages', 1, 'text'])).equal('test2');
  });

  it('User:', () => {
    const [serverStore
      , {clientStore0, User0}
      , {clientStore1, User1}
      ] = mockStores(2);
    const clientStore2 = mockClientStore().connect(serverStore);

    expectUnchanged(`Id can't be null`, () =>
        clientStore0.dispatch(chatMessageRequest(null, 'USER', 'test0'))
      , serverStore, clientStore0, clientStore1);
    clientStore0.dispatch(chatMessageRequest(User0.id, 'USER', 'test1'));

    expect(serverStore.getState().getIn(['chat', 'messages'])).size(0);
    expect(serverStore.getState().getIn(['users', User0.id, 'chat', 'messages'])).size(1);
    expect(serverStore.getState().getIn(['users', User1.id, 'chat', 'messages'])).size(0);
    expect(clientStore0.getState().getIn(['user', 'chat', 'messages', 0, 'text'])).equal('test1');
    expect(clientStore1.getState().getIn(['user', 'chat', 'messages', 0, 'text'])).undefined;
    expect(clientStore2.getState().getIn(['user', 'chat', 'messages', 0, 'text'])).undefined;
  });
});