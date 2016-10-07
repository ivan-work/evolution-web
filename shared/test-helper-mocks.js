import {UserModel} from '~/shared/models/UserModel';
import {GameModel} from '~/shared/models/game/GameModel';
import {loginUserRequest} from '~/shared/actions/actions';
import {
  roomCreateRequest
, roomJoinRequest
, gameCreateSuccess
, gameReadyRequest
} from '~/shared/actions/actions';

//export default () => {
  global.mockStores = (count = 2, initialServerStore = void 0) => {
    const serverStore = mockServerStore(initialServerStore);
    const result = [];
    const sandbox = sinon.sandbox.create();
    const UserSpy = sandbox.spy(UserModel, 'new');
    for (let i = 0; i < count; ++i) {
      const clientStore = mockClientStore().connect(serverStore);
      clientStore.dispatch(loginUserRequest('/', 'User' + i, 'testPassword'));
      const User = UserSpy.lastCall.returnValue;
      result.push({
        ['clientStore' + i]: clientStore
        , ['User' + i]: User
      });
    }
    result.forEach((r, i) => r['clientStore' + i].clearActions())
    serverStore.clearActions();
    sandbox.restore();
    result.unshift(serverStore);
    return result;
  };

  global.mockGame = (count = 2, initialServerStore = void 0) => {
    const mockedStores = mockStores(count, initialServerStore);
    const result = [{
      serverStore: mockedStores[0]
      , ServerGame: () => mockedStores[0].getState().get('games').first()
    }];

    mockedStores[1].clientStore0.dispatch(roomCreateRequest());
    const roomId = result[0].serverStore.getState().get('rooms').first().id;

    for (let i = 0; i < count; ++i) {
      const clientStore = mockedStores[i + 1]['clientStore' + i];
      clientStore.dispatch(roomJoinRequest(roomId));
      result.push({
        ...mockedStores[i + 1]
        , ['ClientGame' + i]: () => clientStore.getState().get('game')
      })
    }

    const room = result[0].serverStore.getState().get('rooms').first();

    result[0].ParseGame = (string) => {
      result[0].serverStore.dispatch(gameCreateSuccess(GameModel.parse(room, string)));

      for (let i = 0; i < count; ++i) {
        const clientStore = mockedStores[i + 1]['clientStore' + i];
        clientStore.disconnect();
        clientStore.connect(result[0].serverStore);
      }
    };

    return result;
  };
//}