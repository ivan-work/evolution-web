import React from 'react';
import {Route, IndexRoute} from 'react-router';
import {App} from '../components/app/App';
import {LoginView, RoomsView} from '../views/index';
//import {requireAuthentication} from '../components/AuthenticatedComponent';

const MakeAuthCheck = (getState) => (nextState, replace) => {
  console.log('replace', replace);
  console.log('getState', getState().get('auth').toJS());
  const userExists = getState().get('auth').get('user') != null;
  if (!userExists) {
    replace('/login?redirect=/rooms')
  }
};

export default (getState) => {
  const AuthCheck = MakeAuthCheck(getState);
  return <Route path='/' component={App}>
    <Route path='login' component={LoginView}/>
    <Route path='rooms' component={RoomsView} onEnter={AuthCheck}/>
    {/*<Route path="lobbies2" component={requireAuthentication(LobbiesView)}/>  onEnter={someAuthCheck}*/}
  </Route>
}

/*
<IndexRoute component={LoginView}/>



*/