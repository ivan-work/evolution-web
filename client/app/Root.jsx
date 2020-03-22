import React from 'react';

import {Provider} from 'react-redux'
import {MuiThemeProvider} from '@material-ui/core/styles'
import App from './App.jsx';
import ErrorBoundry from './ErrorBoundry';

import theme from './theme';
import {Router} from "react-router";

class Root extends React.PureComponent {
  render() {
    const {store, history} = this.props;
    return (
      <ErrorBoundry>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <Router history={history}>
              <App/>
            </Router>
          </Provider>
        </MuiThemeProvider>
      </ErrorBoundry>
    );
  }
}

export default Root;