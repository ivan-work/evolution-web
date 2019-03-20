import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react';
import {connect} from 'react-redux';

import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import {gameSetUserTimedOutRequest} from '../../../../shared/actions/actions';

export class GameTimedOutDialog extends React.PureComponent {
  static propTypes = {
    show: PropTypes.bool.isRequired
    , $timedOutRequest: PropTypes.func.isRequired
  };

  render() {
    const {show, $timedOutRequest} = this.props;
    return (
      <div>
        <Dialog open={show} onBackdropClick={$timedOutRequest}>
          <DialogTitle>
            {T.translate('Game.UI.TimedOut_Title')}
          </DialogTitle>
          <DialogActions>
            <Button variant='contained' color='primary' onClick={$timedOutRequest}>{T.translate('Game.UI.TimedOut_Action')}</Button>
          </DialogActions>
        </Dialog>
      </div>);
  }
}

export const GameTimedOutDialogView = connect(
  (state, {game}) => ({
    show: game.getPlayer() ? game.getPlayer().timedOut : false
  })
  , (dispatch, props) => ({
    $timedOutRequest: () => dispatch(gameSetUserTimedOutRequest())
  })
)(GameTimedOutDialog);

GameTimedOutDialogView.propTypes = {
  game: PropTypes.object.isRequired
};

export default GameTimedOutDialogView;