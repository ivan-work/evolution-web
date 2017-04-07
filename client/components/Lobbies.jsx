import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import actionCreators from 'actionCreators'

export const Lobbies = React.createClass({
  mixins: [PureRenderMixin]
  , getInitialState: function () {
    return {user: {
      name: "user"
    }};
  }
  , render: function () {
    return <div className="loginForm">
      <div>Hello {this.props.user.name}</div>
    </div>;
  }
});

export const LobbiesnContainer = connect(
  (state) => {
    this.user = state.user;
  },
  actionCreators
)(Lobbies);
