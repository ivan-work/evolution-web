import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import * as MDL from 'react-mdl';

import {STATUS} from '../../shared/models/UserModel';

export const UsersList = React.createClass({
  mixins: [PureRenderMixin]
  , render: function () {
    return <ul className="UsersList">
      {this.props.list.map((user) => <li key={user.id}>{user.login} ({user.status})</li>)}
    </ul>;
  }
});
