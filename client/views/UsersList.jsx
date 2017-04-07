import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import * as MDL from 'react-mdl';

export const UsersList = React.createClass({
  mixins: [PureRenderMixin]
  , render: function () {
    return <ul className="UsersList">
      {this.props.users.map((user) => {

        console.log(user, user.id)
        return <li key={user.id}>{user.login}
        </li>})}
    </ul>;
  }
});
