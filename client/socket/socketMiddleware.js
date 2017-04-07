import objectAssign from 'object-assign';

export default socket => store => next => action => {
  console.log('to server:', action.type, action.meta);
  if (action.meta && action.meta.socket) {
    console.log('to server:', action.type, action);
    //const clientId = store.getState().get('clientId');
    //socket.emit('action', objectAssign({}, action, {clientId}));
    socket.emit('action', action);
  }

  return next(action);
}
