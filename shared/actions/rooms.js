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
export const roomJoinRequest = (roomId) => ({
  type: 'roomJoinRequest'
  , data: {roomId}
  , meta: {
    server: true
  }
});
export const roomJoinSuccess = (userId, roomId) => ({
  type: 'roomJoinSuccess'
  , data: {userId, roomId}
  , meta: {
    clients: true
  }
});
//export const roomLeaveRequest = () => ({
//  type: 'roomLeaveRequest'
//  , data: {}
//  , meta: {
//    server: true
//  }
//});
//export const roomLeaveSuccess = (room) => ({
//  type: 'roomLeaveSuccess'
//  , data: {room}
//  , meta: {
//    clients: true
//  }
//});
export const roomsClientToServer = {
  roomCreateRequest: (data, meta) => (dispatch, getState) => {
    const state = getState();
    const room = RoomModel.new();
    //console.log('meta', meta);
    dispatch(roomCreateSuccess(room));
    dispatch(roomJoinSuccess(meta.user.id, room.id));
  }
  , roomJoinRequest: (data, meta) => (dispatch, getState) => {
    dispatch(roomJoinSuccess(meta.user.id, data.roomId));
  }
};

export const roomsServerToClient = {
  roomCreateSuccess: (data) => ({
    type: 'roomCreateSuccess'
    , data: {room: RoomModel.fromJS(data.room)}
  })
  , roomJoinSuccess: (data, user) =>  (dispatch, getState) => {
    const {userId, roomId} = data;
    // data.userId data.roomId
    dispatch({
      type: 'roomJoinSuccess'
      , data
    });
    if (user.id === data.userId) {
      dispatch({
        type: 'roomJoinSuccessSelf'
        , data: {roomId}
      });
    }
  }
};