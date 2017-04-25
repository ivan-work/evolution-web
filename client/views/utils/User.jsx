import React from 'react';
import PropTypes from 'prop-types'
import {connect} from 'react-redux';

import {ListItem} from 'react-mdl';

const UserView = connect((state, {id, children}) => ({
  id
  , login: state.getIn(['online', id, 'login'], '---')
  , output: children || ((user) => <span>{user.login}</span>)
}))((props) => props.output(props));

UserView.propTypes = {
  id: PropTypes.string.isRequired
  , children: PropTypes.func
};

UserView.asListItem = ({id, login}) => (<ListItem className='small'>{login}</ListItem>);

export default UserView;