import React, {lazy, Suspense} from 'react';
import {Route, Switch} from 'react-router';

import ProtectedRoute from './ProtectedRoute';

import Login from '../views/Login';
import RouteRoom from './RouteRoom';
import {Test} from '../components/Test.jsx';
import RouteMain from './RouteMain';
import RouteProfile from './RouteProfile';

const LoadingMessage = () => 'Loading...';

export default (
  <Suspense fallback={<LoadingMessage />}>
    <Switch>
      <Route path='/login' component={Login} />
      <ProtectedRoute path={'/room'} component={RouteRoom} />
      <Route path='/test' component={Test} />
      <ProtectedRoute exact path='/' component={RouteMain} />
      <ProtectedRoute exact path='/profile' component={RouteProfile} />
    </Switch>
  </Suspense>
);