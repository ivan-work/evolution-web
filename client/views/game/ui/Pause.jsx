import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import {connect} from 'react-redux';

import IconPause from '@material-ui/icons/Pause';
import IconPlay from '@material-ui/icons/PlayArrow';

import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import {gameSetUserWantsPauseRequest} from '../../../../shared/actions/actions';

// import Tooltip from '../../utils/Tooltip.jsx';

export class Pause extends React.Component {
  static propTypes = {
    $wantsPauseRequest: PropTypes.func.isRequired
  };

  render() {
    const {isPlayer, wantsPause, gamePaused, $wantsPauseRequest} = this.props;

    const tooltip = (
      <span>
        {T.translate(wantsPause ? 'Game.UI.Pause' : 'Game.UI.Unpause')}
        <br/>
        {T.translate(!gamePaused ? 'Game.UI.Pause_Desc' : 'Game.UI.Unpause_Desc')}
      </span>
    );

    return (
      <Tooltip title={tooltip}>
        <span>
          <Button size='small'
                  disabled={!isPlayer}
                  onClick={$wantsPauseRequest(!wantsPause)}>
            {wantsPause ? <IconPlay/> : <IconPause/>}
          </Button>
        </span>
      </Tooltip>
    );
  }
}

export const PauseView = connect(
  (state, props) => {
    const userId = state.getIn(['user', 'id']);
    const player = state.get('game').getPlayer(userId);
    return {
      isPlayer: !!player
      , wantsPause: player && player.getWantsPause()
      , gamePaused: state.get('game').status.paused
    }
  }
  , (dispatch, props) => ({
    $wantsPauseRequest: (wantsPause) => () => dispatch(gameSetUserWantsPauseRequest(wantsPause))
  })
)(Pause);


PauseView.propTypes = {};

export default PauseView;
