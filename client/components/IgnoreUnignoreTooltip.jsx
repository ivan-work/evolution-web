import React from 'react';
import PropTypes from "prop-types";

import {connect} from "react-redux";
import {compose, withHandlers, branch, renderNothing, renderComponent, setPropTypes, setDisplayName} from "recompose";

import {appIgnoreUser, appUnignoreUser} from "../actions/app";

import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import IconIgnore from '@material-ui/icons/MicOff';
import IconUnignore from '@material-ui/icons/Mic';
import WhiteTooltip from "../views/utils/WhiteTooltip";

const WhiteButtonStyle = {fontSize: 12, padding: 0, color: 'white'};
const ButtonStyle = {fontSize: 12, padding: 0};

export const IgnoreButton = compose(
  setDisplayName('IgnoreButton$')
  , setPropTypes({
    userId: PropTypes.string.isRequired
  })
  , connect((state, {userId}) => {
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
    <IconButton style={ButtonStyle} size='small' onClick={onClick}>
      <IconIgnore/>
    </IconButton>
  </Tooltip>
));

export const UnignoreButton = compose(
  setDisplayName('UnignoreButton$')
  , setPropTypes({
    userId: PropTypes.string.isRequired
  })
  , connect((state, {userId}) => {
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
    <IconButton style={ButtonStyle} size='small' onClick={onClick}>
      <IconUnignore/>
    </IconButton>
  </Tooltip>
));

const RenderChildrenHOC = renderComponent(({children}) => children);

export const IgnoreUnignoreTooltip = compose(
  setDisplayName('IgnoreUnignoreTooltip$')
  , setPropTypes({
    userId: PropTypes.string.isRequired
  })
  , connect((state, {userId}) => {
    const appUserId = state.getIn(['user', 'id']);
    const appIgnoredUser = state.getIn(['app', 'ignoreList']).has(userId);
    return {
      hideIgnore: appUserId === userId || appIgnoredUser
      , hideUnignore: appUserId === userId || !appIgnoredUser
    }
  })
  , branch(({hideIgnore, hideUnignore}) => hideIgnore && hideUnignore, RenderChildrenHOC)
)(({children, userId, hideIgnore, hideUnignore, dispatch, ...props}) => (
  <WhiteTooltip interactive title={(
    <span>
      {!hideIgnore && <IgnoreButton userId={userId}/>}
      {!hideUnignore && <UnignoreButton userId={userId}/>}
    </span>
  )} placement='right' {...props}>
    {children}
  </WhiteTooltip>
));

export default IgnoreUnignoreTooltip;