import {RoomModel} from '../models/RoomModel';
import {push} from 'react-router-redux';
import {List, Map} from 'immutable';
import {actionError} from './generic';

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
export const roomCreateSuccess = (room) => ({
  type: 'roomCreateSuccess'
  , data: {room}
  , meta: {users: true}
});
export const roomJoinSuccess = (roomId, userId) => ({
  type: 'roomJoinSuccess'
  , data: {roomId, userId}
  , meta: {users: true}
});
export const roomJoinSuccessSelf = (roomId) => ({
  type: 'roomJoinSuccessSelf'
  , data: {roomId}
});
export const roomExitSuccess = (roomId, userId) => ({
  type: 'roomExitSuccess'
  , data: {roomId, userId}
  , meta: {users: true}
});
export const roomExitSuccessSelf = (roomId) => ({
  type: 'roomExitSuccessSelf'
  , data: {roomId}
});

export const roomsClientToServer = {
  roomCreateRequest: (data, {user}) => (dispatch, getState) => {
    const userId = user.id;
    const room = RoomModel.new();
    dispatch(roomCreateSuccess(room));
    dispatch(roomJoinSuccess(room.id, userId));
  }
  , roomJoinRequest: ({roomId}, {user}) => (dispatch, getState) => {
    const userId = user.id;
    const room = getState().getIn(['rooms', roomId]);
    if (!room) {
      dispatch(actionError(userId, 'bad room')); // TODO add validation
      return;
    }
    const userAlreadyInRoom = room.users.some(uid => uid === userId);
    if (!userAlreadyInRoom) {
      const previousRoom = getState().get('rooms').find(room => {
        return room.users.some(uid => uid === userId);
      });
      if (previousRoom) {
        dispatch(roomExitSuccess(previousRoom.id, userId));
      }
      dispatch(roomJoinSuccess(roomId, userId));
    }
  }
  , roomExitRequest: ({roomId}, {user}) => roomExitSuccess(roomId, user.id)
};

export const roomsServerToClient = {
  roomCreateSuccess: ({room}) => roomCreateSuccess(RoomModel.fromJS(room))
  , roomJoinSuccess: ({roomId, userId}, user) => (dispatch, getState) => {
    dispatch(roomJoinSuccess(roomId, userId));
    if (user.id === userId) {
      dispatch(roomJoinSuccessSelf(roomId));
      dispatch(push(`/room/${roomId}`));
    }
  }
  , roomExitSuccess: ({roomId, userId}, user) => (dispatch, getState) => {
    dispatch(roomExitSuccess(roomId, userId));
    if (user.id === userId) {
      dispatch(roomExitSuccessSelf(roomId));
      dispatch(push(`/`));
    }
  }
};