import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';

export class UsersList extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {users} = this.props;
    return (<ul className="UsersList">
      {users.filter(u => !!u).map((user) => <li key={user.id}>{user.login}</li>).toArray()}
    </ul>);
  }
}

export const UsersListView = connect(
  (state, props) => {
    const online = state.get('online');
    const users = props.list
      ? props.list.map(uid => online.get(uid))
      : online.toList();
    return {users};
  }
)(UsersList);

export default UsersListView;