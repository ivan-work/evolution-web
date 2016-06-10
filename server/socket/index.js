import socketio from 'socket.io';

export default (server, store) => {
  const io = socketio(server);

  //store.subscribe(
  //  () => io.emit('state', store.getState().toJS())
  //);

  io.on('connection', (socket) => {
    //socket.emit('state', store.getState().toJS());
    socket.on('action', store.dispatch.bind(store));
  });

}