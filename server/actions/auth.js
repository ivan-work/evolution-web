import {LOGIN_USER_REQUEST, LOGIN_USER_FAILURE, LOGIN_USER_SUCCESS, LOGOUT_USER} from '~/shared/constants';

export const LOGIN_USER_REQUEST = (clientAction) => {
  return {
    type: LOGIN_USER_REQUEST,
    meta: {
      server: true
    }
  }
}