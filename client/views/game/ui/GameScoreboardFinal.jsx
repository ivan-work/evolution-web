import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import cn from 'classnames';

import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import {GameModelClient, PHASE} from '../../../../shared/models/game/GameModel';

import User from '../../utils/User.jsx'

export default class GameScoreboardFinal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {show: false};
    this.showedOnce = false;
  }

  static propTypes = {
    game: PropTypes.instanceOf(GameModelClient).isRequired
  };

  componentDidUpdate() {
    if (!this.showedOnce && this.props.game.status.phase === PHASE.FINAL) {
      this.showedOnce = true;
      this.setState({show: true});
    }
  }

  render() {
    const {game} = this.props;

    return <span>
      {game.status.phase === PHASE.FINAL
      && <Button className="ShowScoreboardFinal"
                     onClick={() => this.setState({show: true})}>
        {T.translate('Game.UI.Scores.Label')}
      </Button>
      }
      <Dialog open={this.state.show}>
        {this.state.show && <DialogTitle>
          {T.translate('Game.UI.Scores.Winner')}: <strong><User id={game.winnerId}/></strong>
        </DialogTitle>}
        <DialogContent>{this.renderDialogContent()}</DialogContent>
        <DialogActions>
          <Button type='button' variant='contained' color='primary' onClick={() => this.setState({show: false})}>OK</Button>
        </DialogActions>
      </Dialog>
    </span>
  }

  renderDialogContent() {
    const {game} = this.props;

    return (
      game.scoreboardFinal && <table className='mdl-data-table'>
        <tbody>
        <tr>
          <th className='mdl-data-table__cell--non-numeric'>{T.translate('Game.UI.Scores.TablePlayer')}</th>
          <th>{T.translate('Game.UI.Scores.TableScoreNormal')}</th>
          <th>{T.translate('Game.UI.Scores.TableScoreDead')}</th>
        </tr>
        {game.scoreboardFinal.map(({playerId, playing, scoreNormal, scoreDead}) =>
          <tr key={playerId}
              className={cn({'bold': game.winnerId === playerId})}>
            <td className='mdl-data-table__cell--non-numeric'><User id={playerId}/></td>
            <td>{scoreNormal}</td>
            <td>{scoreDead}</td>
          </tr>)}
        </tbody>
      </table>
    )
  }
}