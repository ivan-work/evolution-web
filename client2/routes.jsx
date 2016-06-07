import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './modules/App/App';
import

// require.ensure polyfill for node
if (typeof require.ensure !== 'function') {
  require.ensure = function requireModule(deps, callback) {
    callback(require);
  };
}

// react-router setup with code-splitting
// More info: http://blog.mxstbr.com/2016/01/react-apps-with-pages/
export default (
  <Route path="/" component={App}>
    <IndexRoute getComponent={Login}
    />
  </Route>
);