import React from 'react';

import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'

import routes from '~/client/routes/index.jsx';

export const Root = React.createClass({
  render: function () {
    return <Provider store={this.props.store}>
      <div>
        <Router history={this.props.history}>
          {routes(this.props.store.getState)}
        </Router>
        {this.props.children}
      </div>
    </Provider>
  }
});