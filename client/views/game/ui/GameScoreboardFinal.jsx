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

import User from "../../utils/User";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";

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
                 variant='contained'
                 color='secondary'
                 onClick={() => this.setState({show: true})}>
        {T.translate('Game.UI.Scores.Label')}
      </Button>
      }
      <Dialog open={this.state.show}>
        {this.state.show && <DialogTitle>
          {T.translate('Game.UI.Scores.Winner')}: <User id={game.winnerId} variant='simple'/>
        </DialogTitle>}
        <DialogContent>{this.renderDialogContent()}</DialogContent>
        <DialogActions>
          <Button type='button' variant='contained' color='primary'
                  onClick={() => this.setState({show: false})}>OK</Button>
        </DialogActions>
      </Dialog>
    </span>
  }

  renderDialogContent() {
    const {game} = this.props;

    return (
      game.scoreboardFinal && <Table>
        <TableHead>
          <TableRow>
            <TableCell>{T.translate('Game.UI.Scores.TablePlayer')}</TableCell>
            <TableCell align='center'>{T.translate('Game.UI.Scores.TableScoreNormal')}</TableCell>
            <TableCell align='center'>{T.translate('Game.UI.Scores.TableScoreDead')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {game.scoreboardFinal.map(({playerId, playing, scoreNormal, scoreDead}) => (
            <TableRow key={playerId}
                      className={cn({'bold': game.winnerId === playerId})}>
              <TableCell><User id={playerId}/></TableCell>
              <TableCell align='center'>{scoreNormal}</TableCell>
              <TableCell align='center'>{scoreDead}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}