import socketio from 'socket.io'
import {clientAction} from '../actions/index'

export default (server, store) => {
  const io = socketio(server);

  io.on('connection', (socket) => {
    socket.on('action', (action) => {
      store.dispatch(action)
    });
  });

}