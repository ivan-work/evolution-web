import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Map, List, fromJS} from 'immutable';

//import {gameCreateRequest} from '~/shared/actions/actions';

import {RoomSectionView} from './AdminPanelSections/RoomSection.jsx';
import {GameSectionView} from './AdminPanelSections/GameSection.jsx';

export class AdminPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibility: Map({
        'Admin Panel': true
        , 'Room': true
        , 'Game': false
      })
    }
  }

  render() {
    return <div className="AdminPanel" style={{
      position: 'absolute'
      , left: '240px'
      , top: 0
      , zIndex: 1337
      , background: 'white'
    }}>
      {this.renderSection('Admin Panel', <div>
        {this.props.room && !this.props.room.gameId ? this.renderSection('Room', <RoomSectionView/>) : null}
        {this.props.room && this.props.room.gameId ? this.renderSection('Game', <GameSectionView/>) : null}
      </div>)}
    </div>
  }

  renderSection(name, body) {
    return <div>
      <h6 className='pointer'
          onClick={() => this.setState(({visibility}) => ({visibility: visibility.update(name, value => !value)}))}>
        {name} {this.state.visibility.get(name) ? '▼' : '▲'}
      </h6>
      {this.state.visibility.get(name) ? body : null}
    </div>
  }
}

export const AdminPanelView = connect(
  (state) => {
    const userId = state.getIn(['user', 'id'], '%USERNAME%');
    const roomId = state.get('room');
    const room = state.getIn(['rooms', roomId]);
    return {
      roomId
      , userId
      , room
      //, online: state.getIn(['online'], Map())
    }
  }
  , (dispatch) => ({
  })
)(AdminPanel);
