import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import * as actionCreators from 'actions'

export const Lobbies = React.createClass({
  mixins: [PureRenderMixin]
  , getInitialState: function () {
    return {
      user: {
        name: "user"
      }
    };
  }
  , render: function () {
    return <div className="loginForm">
      <div>Hello {this.state.user.name}</div>
    </div>;
  }
});

export const LobbiesView = connect(
  (state) => ({
    user: state.user
  }),
  actionCreators
)(Lobbies);
