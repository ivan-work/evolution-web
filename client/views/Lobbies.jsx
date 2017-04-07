import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import * as actionCreators from 'actions'

export const Lobbies = React.createClass({
  mixins: [PureRenderMixin]
  , render: function () {
    return <div className="loginForm">
      <div>Hello {this.props.username}</div>
    </div>;
  }
});

export const LobbiesView = connect(
  (state) => ({
    username: state.getIn(['auth', 'user', 'name'], '%USERNAME%')
  }),
  actionCreators
)(Lobbies);
