import {RoomModel} from '../models/RoomModel';
import {push} from 'react-router-redux';
import {List, Map} from 'immutable';

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
      const previousRoom = getState().get('rooms').find(room => {
        return room.users.some(uid => uid === userId);
      });
      if (previousRoom) {
        const previousRoomId = previousRoom.id;
        dispatch(roomUpdate(previousRoomId, previousRoom.leave(userId)));
      }
      dispatch(roomUpdate(roomId, room.join(userId)));
    }
    dispatch(roomJoinSuccess(roomId, userId));
  }
  , roomExitRequest: (data, meta) => (dispatch, getState) => {
    const userId = meta.user.id;
    const roomId = data.roomId;
    const room = getState().getIn(['rooms', roomId]);
    let newRoom = room.leave(userId);
    dispatch(roomUpdate(roomId, newRoom));
    dispatch(roomExitSuccess(userId));
  }
};

export const roomsServerToClient = {
  roomUpdate: (data) => roomUpdate(data.roomId, RoomModel.fromJS(data.room))
  , roomJoinSuccess: (data, user) => (dispatch, getState) => {
    //console.log('roomJoinSuccess', data)
    const {roomId} = data;
    dispatch(roomJoinSuccess(roomId));
    dispatch(push(`/room/${roomId}`));
  }
  , roomExitSuccess: (data, user) => (dispatch, getState) => {
    dispatch(roomExitSuccess());
    dispatch(push(`/`));
  }
};