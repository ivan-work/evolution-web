import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import * as MDL from 'react-mdl';
import {UsersList} from './UsersList.jsx';

export const Rooms = React.createClass({
  mixins: [PureRenderMixin]
  , render: function () {
    console.log(this.props.online.toJS())
    return <div className="loginForm">
      <div>Hello {this.props.login}</div>
      <div>Online: <UsersList users={this.props.online}/></div>
    </div>;
  }
});

export const RoomsView = connect(
  (state) =>  {
    console.log(state.toJS());
    return {
      login: state.getIn(['users', 'user', 'login'], '%USERNAME%')
      , online: state.getIn(['online'], [])
    }
  }
  //, actionCreators
)(Rooms);
