import {Map, List, fromJS} from 'immutable';
import {RoomModel} from '../models/RoomModel';
import {loginUserRequest, roomCreateRequest} from '../actions/actions';

describe('Rooms:', function () {
  describe('Create:', function () {
    it('Simple Success:', () => {
      const serverStore = mockServerStore();
      const clientStore0 = mockClientStore().connect(serverStore);
      const User0ID = clientStore0.getConnectionId();
      clientStore0.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));
      serverStore.clearActions();

      clientStore0.dispatch(roomCreateRequest());

      const Room = serverStore.getActions()[0].data.room;

      expect(serverStore.getActions()[0]).eql({
        type: 'roomCreateSuccess'
        , data: {room: Room}
        , meta: {clients: true}
      });

      console.log(serverStore.getState().get('rooms').toJS());

      expect(serverStore.getState().get('rooms')).equal(Map({
        [Room.id]: new RoomModel({
          id: Room.id
          , name: "Room " + Room.id
          , maxSize: 4
          //, users: List([User0ID])
        })
      }));

      //expect(clientStore0.getActions()[0]).equal({
      //  type: roomCreateRequest
      //  , data: {}
      //  , meta: {server: true, userID:}
      //});

      //expect(serverStore.getState().get('rooms')).equal(Map(new Room()));
      //expect(serverStore.getState().get('users')).equal(Map());

      //expect(serverStore.getActions()[0]).eql({
      //  type: 'socketDisconnect',
      //  data: {connectionId: clientStore0.getConnectionId()}
      //});
      //expect(serverStore.getActions()[1]).eql({
      //  type: 'logoutUser',
      //  data: clientStore0.getConnectionId(),
      //  meta: {clients: true}
      //});
      //expect(serverStore.getActions()[2]).eql({
      //  type: 'socketDisconnect',
      //  data: {connectionId: clientStore1.getConnectionId()}
      //});
    });
  });
});