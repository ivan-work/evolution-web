import React from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {Dialog} from '../../utils/Dialog.jsx';
import {DialogTitle, DialogContent, DialogActions, Button} from 'react-mdl';

import {gameSetUserTimedOutRequest} from '../../../../shared/actions/actions';

export class GameTimedOutDialog extends React.Component {
  static propTypes = {
    show: React.PropTypes.bool.isRequired
    , $timedOutRequest: React.PropTypes.func.isRequired
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
  (state, props) => ({})
  , (dispatch, props) => ({
    $timedOutRequest: () => dispatch(gameSetUserTimedOutRequest())
  })
)(GameTimedOutDialog);

GameTimedOutDialogView.propTypes = {
  show: React.PropTypes.bool.isRequired
};

export default GameTimedOutDialogView;