import {RoomModel} from '../models/RoomModel'
import {push} from 'react-router-redux';
import {List} from 'immutable';

export const roomCreateRequest = () => ({
  type: 'roomCreateRequest'
  , data: {}
  , meta: {server: true}
});
export const roomJoinRequest = (roomId) => ({
  type: 'roomJoinRequest'
  , data: {roomId}
  , meta: {server: true}
});
export const roomExitRequest = () => (dispatch, getState) => dispatch({
  type: 'roomExitRequest'
  , data: {roomId: getState().get('room')}
  , meta: {server: true}
});
export const roomStartGameRequest = (roomId) => ({
  type: 'roomStartGameRequest'
  , data: {roomId}
  , meta: {server: true}
});

export const roomUpdate = (roomId, room) => ({
  type: 'roomUpdate'
  , data: {roomId, room}
  , meta: {users: true}
});
export const roomJoinSuccess = (roomId, userId) => ({
  type: 'roomJoinSuccess'
  , data: {roomId}
  , meta: {userId}
});
export const roomExitSuccess = (userId) => ({
  type: 'roomExitSuccess'
  , data: {}
  , meta: {userId}
});

export const roomsClientToServer = {
  roomCreateRequest: (data, meta) => (dispatch, getState) => {
    const userId = meta.user.id;
    const state = getState();
    const room = RoomModel.new(userId);
    dispatch(roomJoinSuccess(room.id, userId));
    dispatch(roomUpdate(room.id, room))
  }
  , roomJoinRequest: (data, meta) => (dispatch, getState) => {
    const userId = meta.user.id;
    const {roomId} = data;
    const room = getState().getIn(['rooms', roomId]);
    if (!room.users.some(uid => userId === uid)) {
      const newRoom = room.update('users', (users) => users.push(userId));
      dispatch(roomUpdate(roomId, newRoom));
    }
    dispatch(roomJoinSuccess(roomId, userId));
  }
  , roomExitRequest: (data, meta) => (dispatch, getState) => {
    const userId = meta.user.id;
    const roomId = data.roomId;

    const room = getState().getIn(['rooms', roomId]);
    let index = room.users.indexOf(userId);
    let newRoom;
    if (room.users.size == 1) {
      newRoom = null;
    } else {
      newRoom = room.update('users', users => users.remove(index))
    }
    dispatch(roomUpdate(roomId, newRoom));
    dispatch(roomExitSuccess(userId));
  }
};

export const roomsServerToClient = {
  roomUpdate: (data) => roomUpdate(data.roomId, RoomModel.fromJS(data.room))
  , roomJoinSuccess: (data, user) => (dispatch, getState) => {
    const {roomId} = data;
    dispatch(roomJoinSuccess(roomId));
    dispatch(push(`/room/${roomId}`));
  }
  , roomExitSuccess: (data, user) => (dispatch, getState) => {
    dispatch(roomExitSuccess());
    dispatch(push(`/`));
  }
};