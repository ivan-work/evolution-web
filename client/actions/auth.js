import { checkHttpStatus, parseJSON } from '~/shared/utils';
import {LOGIN_USER_REQUEST, LOGIN_USER_FAILURE, LOGIN_USER_SUCCESS, LOGOUT_USER} from '~/shared/constants';
import { Map } from 'immutable';
import { push, replace } from 'react-router-redux';
//import jwtDecode from 'jwt-decode';



export function loginUserRequest(login, password, redirect="/") {
  return {
    type: LOGIN_USER_REQUEST
    , data: {
      login: login
    }
    , meta: {
      server: true
    }
  }
}

//export function loginUserSuccess(username) {
//  //localStorage.setItem('token', token);
//  return {
//    type: LOGIN_USER_SUCCESS,
//    payload: {
//      username: username
//    }
//  }
//}
//
//export function loginUserFailure(error) {
//  //localStorage.removeItem('token');
//  return {
//    type: LOGIN_USER_FAILURE,
//    payload: {
//      status: error.response.status,
//      statusText: error.response.statusText
//    }
//  }
//}
//
//export function logout() {
//  localStorage.removeItem('token');
//  return {
//    type: LOGOUT_USER
//  }
//}
//
//export function logoutAndRedirect() {
//  return (dispatch, state) => {
//    dispatch(logout());
//    dispatch(push(null, '/'));
//  }
//}

//export function receiveProtectedData(data) {
//  return {
//    type: RECEIVE_PROTECTED_DATA,
//    payload: {
//      data: data
//    }
//  }
//}
//
//export function fetchProtectedDataRequest() {
//  return {
//    type: FETCH_PROTECTED_DATA_REQUEST
//  }
//}

//export function fetchProtectedData(token) {
//
//  return (dispatch, state) => {
//    dispatch(fetchProtectedDataRequest());
//    return fetch('http://localhost:3000/getData/', {
//      credentials: 'include',
//      headers: {
//        'Authorization': `Bearer ${token}`
//      }
//    })
//      .then(checkHttpStatus)
//      .then(parseJSON)
//      .then(response => {
//        dispatch(receiveProtectedData(response.data));
//      })
//      .catch(error => {
//        if(error.response.status === 401) {
//          dispatch(loginUserFailure(error));
//          dispatch(pushState(null, '/login'));
//        }
//      })
//  }
//}
