import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import * as actionCreators from 'actionCreators'

export const Login = React.createClass({
  mixins: [PureRenderMixin]
  , getInitialState: function () {
    return {username: "us"};
  }
  , render: function () {
    return <div className="loginForm">
      <input
        value={this.state.username}
        onChange={(e) => this.setState({username: e.target.value})}
        placeholder="Login"
      />
      <button
        onClick={(e) => this.props.login(this.state)}>
        Login
      </button>
    </div>;
  }
});

export const LoginContainer = connect(
  null,
  actionCreators
)(Login);

