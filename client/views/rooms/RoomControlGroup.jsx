import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';

import {branch, compose, renderNothing, withProps, withStateHandlers} from "recompose";
import {connect} from 'react-redux';
import {Route, Router, withRouter} from "react-router";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

import TimeService from '../../services/TimeService';
import {RoomModel} from '../../../shared/models/RoomModel';

import {redirectTo} from "../../../shared/utils/history";
import {
  roomExitRequest,
  roomStartVotingRequest,
  roomJoinRequest,
  roomSpectateRequest
} from '../../../shared/actions/actions';
import {failsChecks} from '../../../shared/actions/checks';
import {checkCanJoinRoomToPlay} from '../../../shared/actions/rooms.checks';

const styles = theme => ({
  menuItem: {
    outline: 'none'
  }
  , menuItemText: {
    padding: 0
  }
  , menuItemTextPrimary: {
    color: theme.palette.primary.dark
  }
});

export const RoomControlGroupMenu = compose(
  withStyles(styles)
  , withStateHandlers({anchorEl: null}
    , {
      openMenu: () => (e) => ({anchorEl: e.target})
      , closeMenu: () => () => ({anchorEl: null})
    })
  , withProps(({$start, closeMenu}) => ({
    $start: () => {
      $start();
      closeMenu();
    }
    , $back: () => {
      redirectTo('/room');
      closeMenu();
    }
  }))
)(
  ({
     classes, text, anchorEl, openMenu, closeMenu
     , userId, room, inRoom, game
     , $back, $exit, $start, $roomJoin, $roomSpectate
   }) => (
    <>
      <Button color='primary'
              variant='contained'
              onClick={openMenu}>
        {T.translate('App.Room.Room')}
      </Button>
      <Menu open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={closeMenu}>
        <ListItem className={classes.menuItem}>
          <ListItemText classes={{root: classes.menuItemText, primary: classes.menuItemTextPrimary}} primary={text}/>
          {/*<Typography className={classes.menuItem}>{text}</Typography>*/}
        </ListItem>

        {!inRoom && <MenuItem onClick={$back}>{T.translate('App.Room.$Back')}</MenuItem>}

        {!game && <MenuItem onClick={$start}
                            disabled={!room.checkCanStart(userId, TimeService.getServerTimestamp())}>
          {T.translate('App.Room.$Start')}
        </MenuItem>}

        {!game && !!~room.spectators.indexOf(userId)
        && <MenuItem onClick={$roomJoin}
                     disabled={failsChecks(() => checkCanJoinRoomToPlay(room, userId))}>
          {T.translate('App.Room.$Play')}
        </MenuItem>}

        {!game && !!~room.users.indexOf(userId)
        && <MenuItem onClick={$roomSpectate}>
          {T.translate('App.Room.$Spectate')}
        </MenuItem>}

        <MenuItem onClick={$exit}>{T.translate('App.Room.$Exit')}</MenuItem>
      </Menu>
    </>
  ));

// https://github.com/acdlite/recompose/issues/467
export const RoomControlGroup = (
  ({history, room, ...props}) => (
    <Router history={history}>
      <Route render={({location}) => {
        const inRoom = !!~location.pathname.indexOf('room');
        return (
          <RoomControlGroupMenu text={`${room.name}`} room={room} inRoom={inRoom} {...props}/>
        )
      }}/>
    </Router>
  )
);

RoomControlGroup.propTypes = {
  userId: PropTypes.string.isRequired
  , roomId: PropTypes.string.isRequired
  , room: PropTypes.instanceOf(RoomModel)
  , $exit: PropTypes.func.isRequired
  , $start: PropTypes.func.isRequired
  , $roomJoin: PropTypes.func.isRequired
  , $roomSpectate: PropTypes.func.isRequired
};

export const RoomControlGroupView = compose(
  connect(
    (state) => {
      const roomId = state.get('room');
      return {
        roomId
        , room: state.getIn(['rooms', roomId])
        , game: state.getIn(['game'])
        , userId: state.getIn(['user', 'id'])
      }
    }
    , {roomExitRequest, roomStartVotingRequest, roomJoinRequest, roomSpectateRequest}
  )
  , withProps(({roomId, inRoom, roomExitRequest, roomStartVotingRequest, roomJoinRequest, roomSpectateRequest}) => ({
    $exit: roomExitRequest
    , $start: roomStartVotingRequest
    , $roomJoin: () => roomJoinRequest(roomId)
    , $roomSpectate: () => roomSpectateRequest(roomId)
  }))
  , branch(({room}) => !room, renderNothing)
  , withRouter
)(RoomControlGroup);

export default RoomControlGroupView;