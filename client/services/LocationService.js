export default {
  getLocationQuery: () => window.location.search.substr(1).split('&').reduce((result, kv) => {
    const [k, v] = kv.split('=');
    return {...result, [k]: v || true};
  }, {})
}
//
// import React from 'react';
// import PropTypes from 'prop-types'
// import T from 'i18n-react';
// import {connect} from 'react-redux';
//
// import TimeService from '../../services/TimeService';
// import {ControlGroup} from './../utils/ControlGroup.jsx';
// import Button from '@material-ui/core/Button';
// import {RoomModel} from '../../../shared/models/RoomModel';
//
// import {redirectTo} from "../../../shared/utils/history";
// import {
//   roomExitRequest,
//   roomStartVotingRequest,
//   roomJoinRequest,
//   roomSpectateRequest
// } from '../../../shared/actions/actions';
// import {failsChecks} from '../../../shared/actions/checks';
// import {checkCanJoinRoomToPlay} from '../../../shared/actions/rooms.checks';
// import {compose, withProps} from "recompose";
//
// /*
//  * RoomControlGroup
//  * */
//
// const buttonProps = {
//   variant: 'outlined'
//   , color: 'inherit'
// };
//
// export class RoomControlGroup extends React.Component {
//   static propTypes = {
//     room: PropTypes.instanceOf(RoomModel)
//     , userId: PropTypes.string.isRequired
//   };
//
//   constructor(props) {
//     super(props);
//     console.log(this.props);
//     this.$start = () => props.$start(props.roomId);
//     this.$roomJoin = () => props.$roomJoin(props.roomId);
//     this.$roomSpectate = () => props.$roomSpectate(props.roomId);
//   }
//
//   back() {
//     console.log(this.props);
//     this.props.$redirectTo(inRoom ? '/' : '/room')
//   }
//
//   render() {
//     const {room, userId, inRoom} = this.props;
//
//     if (!room) return null;
//
//     return <ControlGroup name={T.translate('App.Room.Room')}>
//       <Button id="Room$Back" {...buttonProps}
//               onClick={() => this.back()}>
//         {T.translate('App.Room.$Back')}
//       </Button>
//       <Button id="Room$Exit" {...buttonProps}
//               onClick={this.props.$exit}>
//         {T.translate('App.Room.$Exit')}
//       </Button>
//       {inRoom && !!~room.spectators.indexOf(userId)
//       && <Button id="Room$Play" {...buttonProps}
//                  disabled={failsChecks(() => checkCanJoinRoomToPlay(room, userId))}
//                  onClick={this.$roomJoin}>
//         {T.translate('App.Room.$Play')}
//       </Button>}
//       {inRoom && !!~room.users.indexOf(userId)
//       && <Button id="Room$Spectate" {...buttonProps}
//                  onClick={this.$roomSpectate}>
//         {T.translate('App.Room.$Spectate')}
//       </Button>}
//       <Button id="Room$Start" {...buttonProps}
//               disabled={!room.checkCanStart(userId, TimeService.getServerTimestamp())}
//               onClick={this.$start}>
//         {T.translate('App.Room.$Start')}
//       </Button>
//     </ControlGroup>
//   }
// }
//
// export const RoomControlGroupView = compose(
//   connect(
//     (state) => {
//       const roomId = state.get('room');
//       return {
//         roomId
//         , room: state.getIn(['rooms', roomId])
//         , userId: state.getIn(['user', 'id'])
//         , lang: state.getIn(['app', 'lang'])
//       }
//     }
//     , (dispatch) => ({
//       $exit: () => dispatch(roomExitRequest())
//       , $start: (roomId) => dispatch(roomStartVotingRequest())
//       , $roomJoin: (roomId) => dispatch(roomJoinRequest(roomId))
//       , $roomSpectate: (roomId) => dispatch(roomSpectateRequest(roomId))
//     })
//   )
//   , withProps({
//     goBack: () => {
//       const inRoom = !!~window.location.pathname.indexOf('room');
//       redirectTo(inRoom ? '/' : '/room')
//     }
//   })
// )(RoomControlGroup);
//
// export default RoomControlGroupView;