import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import * as MDL from 'react-mdl';

export const UsersList = React.createClass({
  mixins: [PureRenderMixin]
  , render: function () {
    return <ul className="UsersList">
      {this.props.list.map((user) => <li key={user.id}>{user.login}</li>).toArray()}
    </ul>;
  }
});
