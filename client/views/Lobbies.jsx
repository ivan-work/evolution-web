import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
//import * as actionCreators from 'actions'

export const Lobbies = React.createClass({
  mixins: [PureRenderMixin]
  , render: function () {
    return <div className="loginForm">
      <div>Hello {this.props.login}</div>
    </div>;
  }
});

export const LobbiesView = connect(
  (state) =>  {
    console.log(state.toJS());
    console.log(state.getIn(['auth']).toJS());
    console.log(state.getIn(['auth', 'user']));
    console.log(state.getIn(['auth', 'user', 'login']));
    return {
      login: state.getIn(['auth', 'user', 'login'], '%USERNAME%')
    }
  }
  //, actionCreators
)(Lobbies);
