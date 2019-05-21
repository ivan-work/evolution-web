import React from 'react';

import {connect} from "react-redux";
import {compose, withHandlers, branch, renderNothing, renderComponent} from "recompose";

import {appIgnoreUser, appUnignoreUser} from "../actions/app";

import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import IconIgnore from '@material-ui/icons/MicOff';
import IconUnignore from '@material-ui/icons/Mic';

const WhiteButtonStyle = {fontSize: 12, padding: 0, color: 'white'};

export const IgnoreButton = compose(
  connect((state, {userId}) => {
      const appUserId = state.getIn(['user', 'id']);
      const appIgnoredUser = state.getIn(['app', 'ignoreList']).has(userId);
      return {hide: appUserId === userId || appIgnoredUser}
    }
    , {appIgnoreUser}
  )
  , branch(({hide}) => hide, renderNothing)
  , withHandlers({onClick: ({appIgnoreUser, userId}) => e => appIgnoreUser(userId)})
)(({onClick}) => (
  <Tooltip title={'ignore'} placement='right'>
    <IconButton style={WhiteButtonStyle} size='small' onClick={onClick}>
      <IconIgnore/>
    </IconButton>
  </Tooltip>
));

export const UnignoreButton = compose(
  connect((state, {userId}) => {
      const appUserId = state.getIn(['user', 'id']);
      const appIgnoredUser = state.getIn(['app', 'ignoreList']).has(userId);
      return {hide: appUserId === userId || !appIgnoredUser}
    }
    , {appUnignoreUser}
  )
  , branch(({hide}) => hide, renderNothing)
  , withHandlers({onClick: ({appUnignoreUser, userId}) => e => appUnignoreUser(userId)})
)(({onClick}) => (
  <Tooltip title={'unignore'} placement='right'>
    <IconButton style={WhiteButtonStyle} size='small' onClick={onClick}>
      <IconUnignore/>
    </IconButton>
  </Tooltip>
));

const RenderChildrenHOC = renderComponent(({children}) => children);

export const IgnoreUnignoreTooltip = compose(
  connect((state, {userId}) => {
    const appUserId = state.getIn(['user', 'id']);
    const appIgnoredUser = state.getIn(['app', 'ignoreList']).has(userId);
    return {
      hideIgnore: appUserId === userId || appIgnoredUser
      , hideUnignore: appUserId === userId || !appIgnoredUser
    }
  })
  , branch(({hideIgnore, hideUnignore}) => hideIgnore && hideUnignore, RenderChildrenHOC)
)(({children, userId, hideIgnore, hideUnignore, ...props}) => (
  <Tooltip interactive title={(
    <span>
      {!hideIgnore && <IgnoreButton userId={userId}/>}
      {!hideUnignore && <UnignoreButton userId={userId}/>}
    </span>
  )} placement='right' {...props}>
    {children}
  </Tooltip>
));

export default IgnoreUnignoreTooltip;