import React from 'react';

import {Provider} from 'react-redux'
import {MuiThemeProvider} from '@material-ui/core/styles'
import App from './App.jsx';
import ErrorBoundry from './ErrorBoundry';

import theme from './theme';
import {Router} from "react-router";

export const Root = ({store, history}) => (
  <ErrorBoundry>
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <Router history={history}>
          <App history={history}/>
        </Router>
      </Provider>
    </MuiThemeProvider>
  </ErrorBoundry>
);