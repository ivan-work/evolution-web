import React from 'react';
import PropTypes from 'prop-types'
import cn from 'classnames'
import {connect} from 'react-redux';

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Tooltip from "@material-ui/core/Tooltip";
import T from "i18n-react";

import PersonIcon from '@material-ui/icons/Person';
import StarIcon from '@material-ui/icons/Star';
import IconButton from "@material-ui/core/IconButton";
import IconKickUser from '@material-ui/icons/Clear';
import IconBanUser from '@material-ui/icons/Block';
import Typography from "@material-ui/core/Typography";
import {USER_AWARDS} from "../../../shared/models/UserModel";

const defaultUser = (id) => ({
  id, login: '---'
});

const cnUser = (user, className = '') => cn(
  'User'
  , className
  , {auth: user.authType}
);

const getUserIcon = (user, showIcon) => {
  if (user && showIcon) {
    // this shit doesn't work somehow
    // if (user.getIn(['awards', USER_AWARDS.TOURNEY])) {
    //   return (<StarIcon className='icon' />);
    // } else
    if (user.authType) {
      return (<PersonIcon className='icon'/>);
    }
  }
};

export const UserVariants = {
  simple: ({user, login, showIcon, className}) => (
    <span className={cnUser(user, className)}>
      {getUserIcon(user, showIcon)}{login || user.login}
    </span>
  )
  , typography: ({user, login, showIcon, className}) => (
    <Typography display='inline'
                className={cnUser(user, className)}
                color='inherit'
                component='span'>
      {getUserIcon(user, showIcon)}{login || user.login}
    </Typography>
  )
  , listItem: (props) => {
    const {user, login, actions} = props;
    return (
      <ListItem key={user.id} className={cnUser(user)} style={{width: 'auto'}}>
        <ListItemText primary={UserVariants.simple(props)}/>
        {!!actions ? actions : null}
      </ListItem>
    )
  }
  , listItemWithActions: ({user, userId, isHost, roomKickRequest, roomBanRequest, ...props}) => (
    <UserVariants.listItem user={user} {...props} actions={
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

UserConnected.displayName = 'UserConnected';

UserConnected.propTypes = {
  id: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['simple', 'typography', 'listItem', 'listItemWithActions'])
};
UserConnected.defaultProps = {
  variant: 'typography'
};

export default UserConnected;