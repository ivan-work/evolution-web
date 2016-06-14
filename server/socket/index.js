import socketio from 'socket.io';

export default (server, store) => {
  const io = socketio(server);

  store.subscribe(
    (a, b, c) => {
      console.log('subs', a, b, c)
    })

  io.on('connection', (socket) => {
    //socket.emit('state', store.getState().toJS());
    console.log('connection');
    socket.on('action', store.dispatch.bind(store));
  });

}