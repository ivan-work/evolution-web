import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import * as MDL from 'react-mdl';

import {GameModelClient} from '../../../../shared/models/game/GameModel';
import {Dialog, DialogActions} from '../../utils/Dialog.jsx';

export class GameScoreboardFinal extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.state = {showDialog: props.show}
  }

  static propTypes = {
    game: React.PropTypes.instanceOf(GameModelClient).isRequired
  };

  render() {
    const {game} = this.props;

    if (!this.state.showDialog) return null;

    return <Dialog>
      <MDL.DialogTitle>{game.winnerId === game.getPlayer().id ? 'You won :)' : 'You lost :('}</MDL.DialogTitle>
      <MDL.DialogContent>
        <table>
          <tbody>
          <tr>
            <th>Player</th>
            <th>Score</th>
          </tr>
          </tbody>
        </table>
      </MDL.DialogContent>
      <DialogActions>
        <MDL.Button type='button' raised primary onClick={() => this.setState({showDialog: false})}>OK</MDL.Button>
      </DialogActions>
    </Dialog>
  }
}



//return <Dialog>
//  <MDL.DialogTitle>{game.winnerId === game.getPlayer().id ? 'You won :)' : 'You lost :('}</MDL.DialogTitle>
//  <MDL.DialogContent>
//    <table>
//      <tbody>
//      <tr>
//        <th>Player</th>
//        <th>Score</th>
//      </tr>
//      {game.scoreboardFinal.map(({playerId, score}) => <tr key={playerId}>
//        <th>{playerId}</th>
//        <th>{score}</th>
//      </tr>)}
//      </tbody>
//    </table>
//  </MDL.DialogContent>
//  <MDL.DialogActions>
//    <MDL.Button type='button'>Agree</MDL.Button>
//    <MDL.Button type='button'>Disagree</MDL.Button>
//  </MDL.DialogActions>
//</Dialog>