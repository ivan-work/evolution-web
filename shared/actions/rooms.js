import {RoomModel} from '../models/RoomModel'
import uuid from 'node-uuid';

export const roomCreateRequest = () => ({
  type: 'roomCreateRequest'
  , data: {}
  , meta: {
    server: true
  }
});
export const roomCreateSuccess = (room) => ({
  type: 'roomCreateSuccess'
  , data: {room}
  , meta: {
    clients: true
  }
});
export const roomsClientToServer = {
  roomCreateRequest: (meta, data) => (dispatch, getState) => {
    const state = getState();
    const id = (process.env.TEST ? uuid.v4().substr(0, 4) : uuid.v4())
    const room = new RoomModel({
      id: id
      , name: 'Room ' + id
    });
    console.log('meta', meta);
    dispatch(roomCreateSuccess(room));
  }
};

export const roomsServerToClient = {};