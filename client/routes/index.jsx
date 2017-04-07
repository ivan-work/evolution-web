import React from 'react';
import {Route, IndexRoute} from 'react-router';
import {App} from '../containers/App';
import {LoginView, LobbiesView} from '../views';
import {Login} from '../views/Login';
import {requireAuthentication} from '../components/AuthenticatedComponent';

export default(
  <Route path='/' component={App}>
    {<IndexRoute component={Login}/>
    //<Route path="lobbies" component={requireAuthentication(LobbiesView)}/>
    }
  </Route>
);
