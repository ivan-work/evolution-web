import React from 'react';

import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'

import routes from '~/client/routes/index.jsx';

export const Root = props =>
  <Provider store={props.store}>
    <div>
      <Router history={props.history}>
        {routes(props.store.getState)}
      </Router>
      {props.children}
    </div>
  </Provider>;