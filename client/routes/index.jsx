import React from 'react';
import {Route, IndexRoute} from 'react-router';
import {App} from '../components/app/App';
import {LoginView, RoomsView} from '../views/index';

const MakeAuthCheck = (getState) => (nextState, replace) => {
  //console.log('getState', getState().toJS());
  const userExists = getState().get('user') != null;
  if (!userExists) {
    //replace('/login?redirect=/rooms')
    replace('/login')
  }
};

export default (getState) => {
  const AuthCheck = MakeAuthCheck(getState);
  return <Route path='/' component={App}>
    <Route path='login' component={LoginView}/>
  </Route>
}
//<Route path='login' component={LoginView}/>
//<IndexRoute component={RoomsView} onEnter={AuthCheck}/>