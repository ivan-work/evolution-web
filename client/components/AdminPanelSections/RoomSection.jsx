import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Map, List, fromJS} from 'immutable';

import {roomSetSeedRequest, roomStartVotingRequest, roomEditSettingsRequest} from '../../../shared/actions/actions';

const defaultGameSeed = `deck: 12 carnivorous, 6 sharp
phase: feeding
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

    <div style={{marginBottom: '10px'}}>
      <input
        type="number"
        placeholder="Количество еды"
        value={this.state.fixedFoodInput || ''}
        onChange={(e) => this.setState({fixedFoodInput: e.target.value})}
        style={{padding: '5px', width: '100px'}}
      />
      <h6
        className="pointer"
        onClick={() => this.props.$setFixedFood(this.props.room, this.state.fixedFoodInput)}
        style={{display: 'inline', marginLeft: '10px'}}
      >
        Установить еду
      </h6>
    </div>

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

export const RoomSectionView = connect(
  (state) => {
    const userId = state.getIn(['user', 'id'], '%USERNAME%');
    const roomId = state.get('room');
    const room = state.getIn(['rooms', roomId]);
    const gameCanStart = room ? room.checkCanStart(userId) : false;
    return {
      roomId,
      userId,
      room,
      gameCanStart
    };
  },
  (dispatch) => ({
    $start: (roomId, seed) => () => {
      dispatch(roomSetSeedRequest(seed));
      dispatch(roomStartVotingRequest());
    },
    $setFixedFood: (room, fixedFood) => () => {
      if (!fixedFood || isNaN(fixedFood)) {
        alert('Введи число');
        return;
      }

      dispatch(roomEditSettingsRequest({
        name: room.name,
        maxPlayers: room.settings.maxPlayers,
        timeTurn: room.settings.timeTurn / 1000,
        timeTraitResponse: room.settings.timeTraitResponse / 1000,
        randomPlayers: room.settings.randomPlayers,
        halfDeck: room.settings.halfDeck,
        maxCards: room.settings.maxCards,
        addon_base2: room.settings.addon_base2,
        addon_timeToFly: room.settings.addon_timeToFly,
        addon_continents: room.settings.addon_continents,
        addon_bonus: room.settings.addon_bonus,
        addon_plantarium: room.settings.addon_plantarium,
        addon_customff: room.settings.addon_customff,
        addon_lifecycle: room.settings.addon_lifecycle,
        fixedFood: parseInt(fixedFood)
      }));
    }
  })
)(RoomSection);
