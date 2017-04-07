import {User} from '~/shared/models/User';
import {LOGIN_USER_REQUEST, LOGIN_USER_FAILURE, LOGIN_USER_SUCCESS, LOGOUT_USER} from '~/shared/constants';

export const client = {
  [LOGIN_USER_REQUEST]: (client, data) => (dispatch, getState) => {
    console.log('server: LOGIN_USER_REQUEST', getState());
    const username = data.username;
    const state = getState().get('users');
    const userExists = state.find(user => user.name === username);
    console.log (userExists);
    console.log (!userExists);
    console.log (!!userExists);
    if (!userExists) {
      const user = User(client, data.username);
      return dispatch(loginUserSuccess(client, user));
    } else {
      return dispatch(loginUserFailure(client, 'User already exists'));
    }
  }
};

export const loginUserSuccess = (client, user) => ({
  type: LOGIN_USER_SUCCESS
  , data: user
  , meta: {
    client: client
  }
});

export const loginUserFailure = (client, msg) => ({
  type: LOGIN_USER_FAILURE
  , data: msg
  , meta: {
    client: client
  }
});