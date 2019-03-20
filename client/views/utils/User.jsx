import React from 'react';
import PropTypes from 'prop-types'
import {connect} from 'react-redux';

import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import T from "i18n-react";

import IconButton from "@material-ui/core/IconButton/IconButton";
import IconKickUser from '@material-ui/icons/Clear';
import IconBanUser from '@material-ui/icons/Block';
import Typography from "@material-ui/core/Typography/Typography";

const defaultUser = (id) => ({
  id, login: '---'
});

export const UserAsSimple = ({user}) => <Typography inline>{user.login}</Typography>;

export const UserAsListItem = ({user, actions}) => (<ListItem key={user.id}>
  <ListItemText primary={user.login}/>
  {!!actions ? actions : null}
</ListItem>);

export const UserAsListItemWithActions = ({user, userId, isHost, roomKickRequest, roomBanRequest}) => (
  <UserAsListItem user={user} actions={
    user.id !== userId && isHost && <ListItemSecondaryAction>
      <Tooltip title={T.translate('App.Room.$Kick')}>
        <IconButton onClick={() => roomKickRequest(user.id)}><IconKickUser/></IconButton>
      </Tooltip>
      <Tooltip title={T.translate('App.Room.$Ban')}>
        <IconButton onClick={() => roomBanRequest(user.id)}><IconBanUser/></IconButton>
      </Tooltip>
    </ListItemSecondaryAction>}
  />
);

export const UserConnected = connect(
  (state, {id}) => ({
    id
    , user: state.getIn(['online', id], defaultUser(id))
  })
)(({children, ...props}) => children ? children(props) : UserAsSimple(props));

UserConnected.propTypes = {
  id: PropTypes.string.isRequired
};

UserConnected.asListItem = ({id, login}) => (<ListItem className='small'>{login}</ListItem>);

export default UserConnected;