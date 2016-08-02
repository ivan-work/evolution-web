import {GameModel} from '../models/game/GameModel';
import {push} from 'react-router-redux';
import {List} from 'immutable';

export const gameStart = (gameModel) => ({
  type: 'roomStart'
  , data: {}
  , meta: {users: gameModel.players}
});

export const gameClientToServer = {
  roomStartGameRequest: (data, meta) => (dispatch, getState) => {
    console.log('roomStartGameRequest');
    const state = getState();
    const userId = meta.user.id;
    const roomId = data.roomId;
    const room = state.getIn(['rooms', roomId]);
    const users = room.users.map(userId => state.get('users').get(userId));
    if (room.canStart(userId)) {
      console.log(GameModel.new(room, users));
      dispatch(gameStart(GameModel.new(room, users)));
    }
  }
};

export const gameServerToClient = {
};