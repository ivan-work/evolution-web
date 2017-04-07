import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Map, List, fromJS} from 'immutable';
export class AdminPanel extends Component {
  static contextTypes = {
    location: React.PropTypes.object
  };

  constructor(props) {
    super(props);
    this.onInput = this.onInput.bind(this);
    this.state = {
      visibility: Map({
        'Admin Panel': true
        , 'Room': true
      })
      , gameSeed: Map({
        deck: [[12, 'Carnivorous']]
        , status: [0, 0, 0, 1]
        , players: List([Map({
          hand: [1]
          , continent: [2]
        }), Map({
          hand: [3]
          , continent: [4]
        })])
      })
    }
  }

  validateInput(value) {
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  }

  toInput(value) {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  onInput(...path) {
    const gameSeed = this.state.gameSeed;
    return (e) => {
      let value = e.target.value;
      try {
        value = JSON.parse(value);
      } catch (e) {
      }
      this.setState(({gameSeed}) => ({gameSeed: gameSeed.updateIn([...path], prev => value)}))
    }
  }

  render() {
    return <div className="AdminPanel" style={{
      position: 'fixed'
      , left: '40%'
      , top: 0
    }}>
      {this.renderComponent('Admin Panel', <div>
        {this.props.roomId ? this.renderComponent('Room', this.renderGameSeedForm()) : null}
      </div>)}
    </div>
  }

  renderComponent(name, body) {
    return <div>
      <h6 className='pointer'
          onClick={() => this.setState(({visibility}) => ({visibility: visibility.update(name, value => !value)}))}>
        {name} {this.state.visibility.get(name) ? '▲' : '▼'}
      </h6>
      {this.state.visibility.get(name) ? body : null}
    </div>
  }

  renderGameSeedForm() {
    return <div>
      <h6 className="pointer" onClick={() => console.log('Game Seed: ', this.state.gameSeed.toJS())}>console.log(↯)</h6>
      <table>
        <tbody>
        <tr>
          <td>Deck:</td>
          <td>{this.renderGameSeedTextarea('deck')}</td>
        </tr>
        <tr>
          <td>Status:</td>
          <td>{this.renderGameSeedTextarea('status')}</td>
        </tr>
        {this.props.roomUsers.map((userId, index) => [<tr key={userId + 'name'}>
          <td>{userId}, {this.props.online.get(userId).login}</td><td></td>
        </tr>, <tr key={userId + 'hand'}>
          <td>Hand: </td>
          <td>{this.renderGameSeedTextarea('players', index, 'hand')}</td>
        </tr>, <tr key={userId + 'continent'}>
          <td>Continent: </td>
          <td>{this.renderGameSeedTextarea('players', index, 'continent')}</td>
        </tr>]).toArray()}
        </tbody>
      </table>
    </div>
  }

  renderGameSeedTextarea(...path) {
    const gameSeed = this.state.gameSeed;
    const value = this.toInput(gameSeed.getIn([...path]));
    return <textarea
      rows={1}
      value={value}
      style={{
        overflow: 'hidden'
        , background: (this.validateInput(value) ? '#afa' : '#faa')
      }}
      onChange={this.onInput(...path)}/>
  }
}

export const AdminPanelView = connect(
  (state) => {
    const roomId = state.get('room');
    return {
      roomId
      , roomUsers: state.getIn(['rooms', roomId, 'users'], List())
      , online: state.getIn(['online'], Map())
    }
  }
  , (dispatch) => ({})
)(AdminPanel);
