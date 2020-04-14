import React from 'react';
import {connect} from 'react-redux';
import {branch, compose, renderNothing} from "recompose";
import get from "lodash/fp/get";

import AppBarMenu from "../app/appbar/AppBarMenu";
import RoomSection from "./AdminControlGroupSections/RoomSection";
import GameSection from "./AdminControlGroupSections/GameSection";

const styles = theme => ({});

export const AdminMenu = ({room}) => (
  <AppBarMenu text='admin'>
    {room && !room.gameId && <RoomSection/>}
    {room && !!room.gameId && <GameSection/>}
  </AppBarMenu>
);

// export class AdminPanel extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       visibility: Map({
//         'Admin Panel': false
//         , 'Room': true
//         , 'Game': false
//       })
//     }
//   }
//
//   render() {
//     if (!this.props.visible) return null;
//
//     return <div className="AdminPanel" style={{
//       position: 'absolute'
//       , right: '0px'
//       , zIndex: 1337
//       , background: 'white'
//     }}>
//       {this.renderSection('Admin Panel', <div>
//         {this.props.room && !this.props.room.gameId ? this.renderSection('Room', <RoomSectionView/>) : null}
//         {this.props.room && this.props.room.gameId ? this.renderSection('Game', <GameSectionView/>) : null}
//       </div>)}
//     </div>
//   }
//
//   renderSection(name, body) {
//     return <div>
//       <h6 className='pointer'
//           onClick={() => this.setState(({visibility}) => ({visibility: visibility.update(name, value => !value)}))}>
//         {name} {this.state.visibility.get(name) ? '▼' : '▲'}
//       </h6>
//       {this.state.visibility.get(name) ? body : null}
//     </div>
//   }
// }

export default compose(
  connect(
    (state) => {
      const userId = state.getIn(['user', 'id'], '%USERNAME%');
      const roomId = state.get('room');
      const room = state.getIn(['rooms', roomId]);
      const hidden = !state.getIn(['app', 'adminMode']);
      return {
        roomId
        , userId
        , room
        , hidden
        //, online: state.getIn(['online'], Map())
      }
    }
    , (dispatch) => ({})
  )
  , branch(get('hidden'), renderNothing)
)(AdminMenu);
