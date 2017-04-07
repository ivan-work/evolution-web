import React from 'react';

import { syncHistoryWithStore } from 'react-router-redux'
import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'

import routes from '~/client/routes';

export const Root = React.createClass({
  componentWillMount: function () {
    console.log('Root:componentWillMount', this.props)
    const store = this.props.store;
  }
  , render: function () {
    console.log('render called');
    const history = syncHistoryWithStore(browserHistory, this.props.store, {
      selectLocationState: (state) => state.get('routing').toJS()
    });
    return <Provider store={this.props.store}>
      <div>
        <Router history={history}>
          {routes(this.props.store.getState)}
        </Router>
        {this.props.children}
      </div>
    </Provider>
  }
});