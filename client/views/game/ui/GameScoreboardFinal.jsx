import React, {Fragment} from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import cn from 'classnames';
import {connect} from "react-redux";

import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import {PHASE} from '../../../../shared/models/game/GameModel';

import User from "../../utils/User";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import withStyles from "@material-ui/core/styles/withStyles";
import {branch, compose, renderNothing} from "recompose";

const styles = {
  tableRow: {
    '&.notPlaying': {
      color: 'gray'
      , textDecoration: 'line-through'
    }
  }
  , tableCell: {
    color: 'inherit'
  }
};

export class GameScoreboardFinal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {show: false};
    this.showedOnce = false;
    console.log(this.showedOnce, this.props.game.status.phase)
  }

  componentDidMount() {
    this.tryToShow();
  }

  componentDidUpdate() {
    this.tryToShow();
  }

  tryToShow() {
    console.log(this.showedOnce, this.props.game.status.phase)
    if (!this.showedOnce && this.props.game.status.phase === PHASE.FINAL) {
      this.showedOnce = true;
      this.setState({show: true});
    }
  }

  render() {
    const {game} = this.props;

    return <Fragment>
      <Button className="ShowScoreboardFinal"
              variant='contained'
              color='secondary'
              onClick={() => this.setState({show: true})}>
        {T.translate('Game.UI.Scores.Label')}
      </Button>
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
    </Fragment>
  }

  renderDialogContent() {
    const {classes, game} = this.props;

    return (
      game.scoreboardFinal && <Table>
        <TableHead>
          <TableRow>
            <TableCell>{T.translate('Game.UI.Scores.TablePlayer')}</TableCell>
            <TableCell align='center'>{T.translate('Game.UI.Scores.TableScoreNormal')}</TableCell>
            <TableCell align='center'>{T.translate('Game.UI.Scores.TableScoreDead')}</TableCell>
            <TableCell align='center'>{T.translate('Game.UI.Scores.TableScoreRandom')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {game.scoreboardFinal.map(({playerId, playing, scoreNormal, scoreDead, scoreRandom}) => (
            <TableRow key={playerId}
                      className={cn(classes.tableRow, {
                        notPlaying: !playing
                        , bold: game.winnerId === playerId
                      })}>
              <TableCell className={classes.tableCell}><User id={playerId}/></TableCell>
              <TableCell className={classes.tableCell} align='center'>{scoreNormal}</TableCell>
              <TableCell className={classes.tableCell} align='center'>{scoreDead}</TableCell>
              <TableCell className={classes.tableCell} align='center'>{scoreRandom.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}

export default compose(
  withStyles(styles)
  , connect(({game}) => ({game}))
  , branch(({game}) => !(game && game.status.phase === PHASE.FINAL), renderNothing)
)(GameScoreboardFinal)