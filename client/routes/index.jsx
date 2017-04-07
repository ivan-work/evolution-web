import React from 'react';
import {Route, IndexRoute} from 'react-router';
import {App} from '../components/App.jsx';
import {LoginView, RoomsView, Room, GameWrapperView} from '../views/index';
import {Test} from '../components/Test.jsx';

const MakeAuthCheck = (getState) => (nextState, replace) => {
  //console.log('getState', getState().toJS());
  //console.log('Auth check');
  const userExists = getState().get('user') != null;
  if (!userExists) {
    console.log('Auth check failed, redirecting to /login');
    //replace('/login?redirect=/rooms')
    replace('/login')
  }
};

const MakeLoginCheck = (getState) => (nextState, replace) => {
  //console.log('getState', getState().toJS());
  //console.log('Auth check');
  const userExists = getState().get('user') != null;
  console.log(getState().get('user'));
  if (userExists) replace('/')
};

export default (getState) => {
  const AuthCheck = MakeAuthCheck(getState);
  const LoginCheck = MakeLoginCheck(getState);
  return <Route path='/' component={App}>
    <IndexRoute component={RoomsView} onEnter={AuthCheck}/>
    <Route path='login' component={LoginView} onEnter={LoginCheck}/>
    <Route path='room/*' component={Room} onEnter={AuthCheck}/>
    <Route path='game' component={GameWrapperView} onEnter={AuthCheck}/>
    <Route path='test' component={Test}/>
  </Route>
}
//<Route path='login' component={LoginView}/>
//