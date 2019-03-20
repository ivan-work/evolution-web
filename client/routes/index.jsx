import React, {lazy, Suspense} from 'react';
import {Route, Switch} from 'react-router';

import ProtectedRoute from './ProtectedRoute';

import Login from '../views/Login';
import RouteMain from './RouteMain';
import RouteRoom from './RouteRoom';
import {Test} from '../components/Test.jsx';

const LoadingMessage = () => 'Loading...';

// const AsyncRouteRoom =  (
//   lazy(() => (
//     import('./RouteRoom')
//   ))
// );

export default (<Suspense fallback={<LoadingMessage />}>
  <Switch>
    <Route path='/login' component={Login}/>
    <ProtectedRoute path={'/room'} component={RouteRoom}/>
    <Route path='/test' component={Test}/>
    <ProtectedRoute exact path='/' component={RouteMain}/>
  </Switch>
</Suspense>
);