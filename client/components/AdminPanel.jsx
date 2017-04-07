import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Map, List, fromJS} from 'immutable';

import {gameCreateRequest} from '~/shared/actions/actions';

export class AdminPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibility: Map({
        'Admin Panel': true
        , 'Room': true
      })
      , gameSeed: `deck: 12 carnivorous, 6 sharp
phase: 2
food: 2
players:
  - hand: 1 sharp, 1 camo
    continent: carn sharp, carn camo
  - hand: 1 sharp, 1 camo
    continent: carn sharp, carn camo
`
    }
  }

  render() {
    return <div className="AdminPanel" style={{
      position: 'fixed'
      , left: '240px'
      , top: 0
      , zIndex: 1337
    }}>
      {this.renderSection('Admin Panel', <div>
        {this.props.showRoomSection ? this.renderSection('Room', this.renderGameSeedForm()) : null}
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

  renderGameSeedForm() {
    return <div>
      {this.props.gameCanStart
        ? <h6 className="pointer" onClick={this.props.$start(this.props.roomId, this.state.gameSeed)}>
        Start Game ►
      </h6>
        : null
        }
      <div><textarea
        rows={8} cols={40}
        value={this.state.gameSeed}
        style={{overflow: 'hidden'}}
        onChange={(e) => this.setState({gameSeed: e.target.value})}/></div>
    </div>
  }
}

export const AdminPanelView = connect(
  (state) => {
    const userId = state.getIn(['user', 'id'], '%USERNAME%');
    const roomId = state.get('room');
    const room = state.getIn(['rooms', roomId]);
    const gameCanStart = room ? room.checkCanStart(userId) : false;
    return {
      roomId
      , userId
      , showRoomSection: room && !room.gameId
      , gameCanStart
      , roomUsers: state.getIn(['rooms', roomId, 'users'], List())
      , online: state.getIn(['online'], Map())
    }
  }
  , (dispatch) => ({
    $start: (roomId, seed) => () => dispatch(gameCreateRequest(roomId, seed))
  })
)(AdminPanel);
