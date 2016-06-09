import React from 'react';
import {Route, IndexRoute} from 'react-router';
import {App} from '../containers/App';
import {LoginView, LobbiesView} from '../views';
import {requireAuthentication} from '../components/AuthenticatedComponent';

export default(
  <Route path='/' component={App}>
    <IndexRoute component={LoginView}/>
    <Route path='lobbies' component={LobbiesView}/>
    {/*<Route path="lobbies2" component={requireAuthentication(LobbiesView)}/>*/}
  </Route>
);
