import React from 'react';
import {Route, IndexRoute} from 'react-router';
import App from '../components/App.jsx';
import {LoginView, RoomsView, Room, GameWrapperView, GamePage} from '../views/index';
import {Test} from '../components/Test.jsx';
import {redirectToLogin} from '../../shared/actions/actions';

const MakeAuthCheck = (store) => (nextState, replace) => {
  if (!store.getState().get('user')) {
    redirectToLogin(store.getState, replace);
  }
};

const MakeLoginCheck = (store) => (nextState, replace) => {
  //console.log('getState', getState().toJS());
  //console.log('Auth check');

  // const userExists = getState().get('user') != null;
  // if (userExists) replace('/')
};

export default (store) => {
  const AuthCheck = MakeAuthCheck(store);
  const LoginCheck = MakeLoginCheck(store);
  return <Route path='/' component={App}>
    <IndexRoute component={RoomsView} onEnter={AuthCheck}/>
    <Route path='login' component={LoginView} onEnter={LoginCheck}/>
    <Route path='room/:roomId' component={Room} onEnter={AuthCheck}/>
    <Route path='game' component={GamePage} onEnter={AuthCheck}/>
    <Route path='test' component={Test}/>
  </Route>
}
//<Route path='login' component={LoginView}/>
//