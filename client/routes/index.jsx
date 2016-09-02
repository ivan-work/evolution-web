import React from 'react';
import {Route, IndexRoute} from 'react-router';
import {App} from '../components/App.jsx';
import {LoginView, RoomsView, RoomView, GameView} from '../views/index';

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

export default (getState) => {
  const AuthCheck = MakeAuthCheck(getState);
  return <Route path='/' component={App}>
    <IndexRoute component={RoomsView} onEnter={AuthCheck}/>
    <Route path='login' component={LoginView}/>
    <Route path='test' component={LoginView}/>
    <Route path='room/*' component={RoomView} onEnter={AuthCheck}/>
    <Route path='game' component={GameView} onEnter={AuthCheck}/>
  </Route>
}
//<Route path='login' component={LoginView}/>
//