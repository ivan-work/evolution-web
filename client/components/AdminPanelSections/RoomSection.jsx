import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Map, List, fromJS} from 'immutable';

import {gameCreateRequest} from '~/shared/actions/actions';

const defaultGameSeed = `deck: 12 carnivorous, 6 sharp
phase: 2
food: 2
players:
  - hand: 1 sharp, 1 camo
    continent: carn sharp, carn camo
  - hand: 1 sharp, 1 camo
    continent: carn sharp, carn camo
`;

export class RoomSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameSeed: window.localStorage.getItem('gameSeed') || defaultGameSeed
    }
  }

  setGameSeed(gameSeed) {
    window.localStorage.setItem('gameSeed', gameSeed);
    this.setState({gameSeed})
  }

  render() {
    return <div>
      <h6 className="pointer" onClick={() => 0}>Add bot</h6>
      {this.props.gameCanStart
        ? <h6 className="pointer" onClick={this.props.$start(this.props.roomId, this.state.gameSeed)}>Start Game ►</h6>
        : null}
      <div>
        <textarea
          rows={8} cols={40}
          value={this.state.gameSeed}
          style={{overflow: 'hidden'}}
          onChange={(e) => this.setGameSeed(e.target.value)}/>
      </div>
    </div>
  }
}

export const RoomSectionView = connect(
  (state) => {
    const userId = state.getIn(['user', 'id'], '%USERNAME%');
    const roomId = state.get('room');
    const room = state.getIn(['rooms', roomId]);
    const gameCanStart = room ? room.checkCanStart(userId) : false;
    return {
      roomId
      , userId
      , gameCanStart
    }
  }
  , (dispatch) => ({
    $start: (roomId, seed) => () => dispatch(gameCreateRequest(roomId, seed))
  })
)(RoomSection);
