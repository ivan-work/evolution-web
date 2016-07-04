//createRoomRequest
export const roomCreateRequest = () => ({
  type: 'roomCreateRequest'
  , data: {}
  , meta: {
    server: true
  }
});
export const roomsClientToServer = {
  roomCreateRequest: (connectionId, data) => (dispatch, getState) => {
    const login = data.login;
    const state = getState();
    const roomExists = state.get('rooms').find(user => user.login == login);
  }
};

export const roomsServerToClient = {};