import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react';
import {connect} from 'react-redux';

import Button from '@material-ui/core/Button';

import Dialog from '../../../app/modals/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';

import {gameSetUserTimedOutRequest} from '../../../../shared/actions/actions';
import {branch, compose, renderNothing} from "recompose";

export class GameTimedOutDialogBase extends React.PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired
    , gameSetUserTimedOutRequest: PropTypes.func.isRequired
  };

  render() {
    const {gameSetUserTimedOutRequest} = this.props;
    return (
      <Dialog open={true}
              onClose={gameSetUserTimedOutRequest}>
        <DialogTitle>
          {T.translate('Game.UI.TimedOut_Title')}
        </DialogTitle>
        <DialogActions>
          <Button variant='contained'
                  color='primary'
                  onClick={gameSetUserTimedOutRequest}>
            {T.translate('Game.UI.TimedOut_Action')}
          </Button>
        </DialogActions>
      </Dialog>);
  }
}

export const GameTimedOutDialog = compose(
  connect(
    ({game}) => ({
      isOpen: game && game.getPlayer() ? game.getPlayer().timedOut : false
    })
    , {gameSetUserTimedOutRequest}
  )
  , branch(({isOpen}) => !isOpen, renderNothing)
)(GameTimedOutDialogBase);

export default GameTimedOutDialog;