import React from 'react';

import {Provider} from 'react-redux'
import {Router, browserHistory} from 'react-router'

import makeRoutes from '../routes/index.jsx';


export class Root extends React.Component {
  constructor(props) {
    super(props);
    this.routes = makeRoutes(props.store);
  }

  render() {
    const props = this.props;
    return (<Provider store={props.store}>
      <div>
        <Router history={props.history}>
          {this.routes}
        </Router>
        {props.children}
      </div>
    </Provider>);
  }
}