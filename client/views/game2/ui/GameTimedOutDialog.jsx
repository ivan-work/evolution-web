import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react';
import {connect} from 'react-redux';
import {Dialog} from '../../utils/Dialog.jsx';
import {DialogTitle, DialogContent, DialogActions, Button} from 'react-mdl';

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
        <Dialog show={show} onBackdropClick={$timedOutRequest}>
          <DialogTitle>
            {T.translate('Game.UI.TimedOut_Title')}
          </DialogTitle>
          <DialogContent></DialogContent>
          <DialogActions fullWidth>
            <Button raised primary onClick={$timedOutRequest}>{T.translate('Game.UI.TimedOut_Action')}</Button>
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