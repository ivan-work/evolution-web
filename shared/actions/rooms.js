import {RoomModel} from '../models/RoomModel'
import {push} from 'react-router-redux';
import {List} from 'immutable';

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
    users: true
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
    users: true
  }
});
export const roomJoinSuccessSelf = (roomId) => ({
  type: 'roomJoinSuccessSelf'
  , data: {roomId}
});
export const roomExitRequest = () => (dispatch, getState) => dispatch({
  type: 'roomExitRequest'
  , data: {roomId: getState().get('room')}
  , meta: {
    server: true
  }
});
export const roomExitSuccess = (userId, roomId) => ({
  type: 'roomExitSuccess'
  , data: {userId, roomId}
  , meta: {users: true}
});
export const roomExitSuccessSelf = () => ({
  type: 'roomExitSuccessSelf'
  , data: {}
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
  , roomExitRequest: (data, meta) => (dispatch, getState) => {
    const userId = meta.user.id;
    const roomId = data.roomId;
    const room = getState().get('rooms').get(roomId);
    if (room && ~room.users.indexOf(userId)) {
      dispatch(roomExitSuccess(meta.user.id, roomId));
    } else {
      throw 'room not found'
    }
  }
};

export const roomsServerToClient = {
  roomCreateSuccess: (data) => roomCreateSuccess(RoomModel.fromJS(data.room))
  , roomJoinSuccess: (data, user) =>  (dispatch, getState) => {
    const {userId, roomId} = data;
    // data.userId data.roomId
    dispatch(roomJoinSuccess(userId, roomId));
    if (user.id === data.userId) {
      dispatch(roomJoinSuccessSelf(roomId));
      dispatch(push(`/room/${roomId}`));
    }
  }
  , roomExitSuccess: (data, user) => (dispatch, getState) => {
    const {userId, roomId} = data;
    dispatch(roomExitSuccess(userId, roomId));
    if (user.id === data.userId) {
      dispatch(roomExitSuccessSelf());
      dispatch(push(`/`));
    }
  }
};