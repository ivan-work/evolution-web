import React from 'react';
import PropTypes from 'prop-types'
import {connect} from 'react-redux';

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import T from "i18n-react";

import IconButton from "@material-ui/core/IconButton";
import IconKickUser from '@material-ui/icons/Clear';
import IconBanUser from '@material-ui/icons/Block';
import Typography from "@material-ui/core/Typography";

const defaultUser = (id) => ({
  id, login: '---'
});

export const UserVariants = {
  simple: ({user}) => <span className='User'>{user.login}</span>
  , typography: ({user, className}) => (
    <Typography className={'User' + (className ? ' ' + className : '')} inline color='inherit' component='span'>
      {user.login}
    </Typography>
  )
  , listItem: ({user, actions}) => (
    <ListItem key={user.id} className='User'>
      <ListItemText primary={user.login}/>
      {!!actions ? actions : null}
    </ListItem>
  )
  , listItemWithActions: ({user, userId, isHost, roomKickRequest, roomBanRequest}) => (
    <UserVariants.listItem user={user} actions={
      user.id !== userId && isHost && <ListItemSecondaryAction>
        <Tooltip title={T.translate('App.Room.$Kick')}>
          <IconButton onClick={() => roomKickRequest(user.id)}><IconKickUser/></IconButton>
        </Tooltip>
        <Tooltip title={T.translate('App.Room.$Ban')}>
          <IconButton onClick={() => roomBanRequest(user.id)}><IconBanUser/></IconButton>
        </Tooltip>
      </ListItemSecondaryAction>}
    />
  )
};

export const UserConnected = connect(
  (state, {id}) => ({
    id
    , user: state.getIn(['online', id], defaultUser(id))
  })
)(({children, variant, ...props}) => children ? children(props) : UserVariants[variant](props));

UserConnected.propTypes = {
  id: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['simple', 'typography', 'listItem', 'listItemWithActions'])
};
UserConnected.defaultProps = {
  variant: 'typography'
};

UserConnected.asListItem = ({id, login}) => (<ListItem className='small'>{login}</ListItem>);

export default UserConnected;