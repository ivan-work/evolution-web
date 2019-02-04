import React, {Fragment} from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import {connect} from 'react-redux';

import TimeService from '../../services/TimeService';
import {ControlGroup} from './../utils/ControlGroup.jsx';
import Button from '@material-ui/core/Button';
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
import {branch, compose, renderNothing, withProps, withStateHandlers} from "recompose";
import Menu from "@material-ui/core/Menu/Menu";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";

/*
 * RoomControlGroup
 * */

const buttonProps = {
  variant: 'outlined'
  , color: 'inherit'
};

// export const RoomControlGroup = ({userId, room, inRoom, $back, $exit, $start, $roomJoin, $roomSpectate}) => (
//   <ControlGroup name={T.translate('App.Room.Room')}>
//     <Button id="Room$Back" {...buttonProps}
//             onClick={$back}>
//       {T.translate('App.Room.$Back')}
//     </Button>
//     <Button id="Room$Exit" {...buttonProps}
//             onClick={$exit}>
//       {T.translate('App.Room.$Exit')}
//     </Button>
//     {inRoom && !!~room.spectators.indexOf(userId)
//     && <Button id="Room$Play" {...buttonProps}
//                disabled={failsChecks(() => checkCanJoinRoomToPlay(room, userId))}
//                onClick={$roomJoin}>
//       {T.translate('App.Room.$Play')}
//     </Button>}
//     {inRoom && !!~room.users.indexOf(userId)
//     && <Button id="Room$Spectate" {...buttonProps}
//                onClick={$roomSpectate}>
//       {T.translate('App.Room.$Spectate')}
//     </Button>}
//     <Button id="Room$Start" {...buttonProps}
//             disabled={!room.checkCanStart(userId, TimeService.getServerTimestamp())}
//             onClick={$start}>
//       {T.translate('App.Room.$Start')}
//     </Button>
//   </ControlGroup>
// );

export const AppBarMenu = compose(
  withStateHandlers({anchorEl: null}
    , {
      openMenu: () => (e) => ({anchorEl: e.target})
      , closeMenu: () => () => ({anchorEl: null})
    })
)(({text, anchorEl, openMenu, closeMenu, children}) => (
  <div>
    <Button color='primary'
            variant='contained'
            onClick={openMenu}>{text}</Button>
    {children(anchorEl, closeMenu)}
  </div>
));

export const RoomControlGroup = ({userId, room, inRoom, $back, $exit, $start, $roomJoin, $roomSpectate}) => (
  <div>
    <AppBarMenu text={`${room.name}`}>
      {(anchorEl, closeMenu) => (
        <Fragment>{JSON.stringify(inRoom)}
        <Menu open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={closeMenu}>
          <MenuItem onClick={$back}>{JSON.stringify(inRoom)}</MenuItem>
          {!inRoom && <MenuItem onClick={$back}>{T.translate('App.Room.$Back')}</MenuItem>}
          <MenuItem onClick={$exit}>
            {T.translate('App.Room.$Exit')}
          </MenuItem>
          {inRoom && !!~room.spectators.indexOf(userId)
          && <MenuItem onClick={$roomJoin}
                       disabled={failsChecks(() => checkCanJoinRoomToPlay(room, userId))}>
            {T.translate('App.Room.$Play')}
          </MenuItem>}
          {inRoom && !!~room.users.indexOf(userId)
          && <MenuItem onClick={$roomSpectate}>
            {T.translate('App.Room.$Spectate')}
          </MenuItem>}
          <MenuItem onClick={$start}
                    disabled={!room.checkCanStart(userId, TimeService.getServerTimestamp())}>
            {T.translate('App.Room.$Start')}
          </MenuItem>
        </Menu></Fragment>
      )}
    </AppBarMenu>


  </div>
);

RoomControlGroup.propTypes = {
  userId: PropTypes.string.isRequired
  , roomId: PropTypes.string.isRequired
  , room: PropTypes.instanceOf(RoomModel)
  , inRoom: PropTypes.bool.isRequired
  , $back: PropTypes.func.isRequired
  , $exit: PropTypes.func.isRequired
  , $start: PropTypes.func.isRequired
  , $roomJoin: PropTypes.func.isRequired
  , $roomSpectate: PropTypes.func.isRequired
};

export const RoomControlGroupView = compose(
  connect(
    (state) => {
      const roomId = state.get('room');
      const inRoom = !!~window.location.pathname.indexOf('room');
      console.log({inRoom});
      return {
        roomId
        , inRoom
        , room: state.getIn(['rooms', roomId])
        , userId: state.getIn(['user', 'id'])
      }
    }
    , {roomExitRequest, roomStartVotingRequest, roomJoinRequest, roomSpectateRequest}
  )
  , withProps(({roomId, inRoom, roomExitRequest, roomStartVotingRequest, roomJoinRequest, roomSpectateRequest}) => ({
    $back: () => redirectTo('/room')
    , $exit: roomExitRequest
    , $start: () => roomStartVotingRequest(roomId)
    , $roomJoin: () => roomJoinRequest(roomId)
    , $roomSpectate: () => roomSpectateRequest(roomId)
  }))
  , branch(({room}) => !room, renderNothing)
)(RoomControlGroup);

export default RoomControlGroupView;