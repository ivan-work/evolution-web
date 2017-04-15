import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Map, List, fromJS} from 'immutable';

export class GameSection extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const {game} = this.props;
    if (!game) return null;
    return <div>
      <div>
        gaem
      </div>
    </div>
  }
}

export const GameSectionView = connect(
  (state) => {
    const userId = state.getIn(['user', 'id'], '%USERNAME%');
    const roomId = state.get('room');
    const room = state.getIn(['rooms', roomId]);
    const game = state.getIn(['rooms', roomId]);
    return {
      roomId
      , userId
      , game
    }
  }
  , (dispatch) => ({})
)(GameSection);
