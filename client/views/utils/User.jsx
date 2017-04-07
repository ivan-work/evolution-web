import React from 'react';
import {connect} from 'react-redux';

const User = {
  name: ({login}) => <span>{login}</span>
};

const UserView = connect((state, {id}) => ({
  login: state.getIn(['online', id, 'login'], '---')
}))((props) => User[props.output](props));

UserView.propTypes = {
  id: React.PropTypes.string
  , output: React.PropTypes.oneOf(Object.keys(User)).isRequired
};

export default UserView;