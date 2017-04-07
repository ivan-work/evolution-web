import {createReducer} from '~/shared/utils';
//import {pushState} from 'redux-router';
//import jwtDecode from 'jwt-decode';
import {Map, fromJS} from 'immutable';
import {UserModel} from '../../shared/models/UserModel';

export const reducer = createReducer(null, {
  loginUserSuccess: (state, data) => {
    const {user} = data;
    return user;
  }
});