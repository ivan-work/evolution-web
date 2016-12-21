import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import * as MDL from 'react-mdl';
import {connect} from 'react-redux';
import cn from 'classnames';

import {GameModelClient, PHASE} from '../../../../shared/models/game/GameModel';
import {Dialog, DialogActions} from '../../utils/Dialog.jsx';

import {UserServicePropType} from '../../../services/UserService'

export default class GameScoreboardFinal extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.state = {show: false};
    this.showedOnce = false;
  }

  static propTypes = {
    game: React.PropTypes.instanceOf(GameModelClient).isRequired
  };

  static contextTypes = {
    userService: UserServicePropType
  };

  componentDidUpdate() {
    if (!this.showedOnce && this.props.game.status.phase === PHASE.FINAL) {
      this.showedOnce = true;
      this.setState({show: true});
    }
  }

  render() {
    const {game} = this.props;
    const {userService} = this.context;

    return <span>
      {game.status.phase === PHASE.FINAL
        ? <MDL.Button className="ShowScoreboardFinal"
                      onClick={() => this.setState({show: true})}>Scores</MDL.Button>
        : null}
      <Dialog show={this.state.show}>
        <MDL.DialogTitle>{game.winnerId === game.getPlayer().id ? 'You won :)' : 'You lost :('}</MDL.DialogTitle>
        <MDL.DialogContent>
          <table>
            <tbody>
            <tr>
              <th>Player</th>
              <th>Score</th>
            </tr>
            {game.scoreboardFinal && game.scoreboardFinal.map(({playerId, score}) =>
            <tr key={playerId}
                className={cn({'bold': game.getPlayer().id === playerId})}>
              <td>{userService.get(playerId) ? userService.get(playerId).login : '---'}</td>
              <td>{score}</td>
            </tr>)}
            </tbody>
          </table>
        </MDL.DialogContent>
        <DialogActions>
          <MDL.Button type='button' raised primary onClick={() => this.setState({show: false})}>OK</MDL.Button>
        </DialogActions>
      </Dialog>
    </span>
  }
}