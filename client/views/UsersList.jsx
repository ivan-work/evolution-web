import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {List, ListItem} from 'react-mdl';

export class UsersList extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.renderUser = props.children || ((user) => <ListItem key={user.id} className='small'>{user.login}</ListItem>);
  }

  render() {
    const {users} = this.props;
    return (<List className="UsersList">
      {users.filter(u => !!u).map(this.renderUser)}
    </List>);
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