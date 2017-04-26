import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import {connect} from 'react-redux';
import {Button, IconButton} from 'react-mdl';

import {gameSetUserWantsPauseRequest} from '../../../../shared/actions/actions';

import Tooltip from '../../utils/Tooltip.jsx';

export class Pause extends React.Component {
  static propTypes = {
    $wantsPauseRequest: PropTypes.func.isRequired
  };

  render() {
    const {isPlayer, wantsPause, gamePaused, $wantsPauseRequest} = this.props;

    return (
      <div>
        <Tooltip overlay={(
          <span>
            {T.translate(wantsPause ? 'Game.UI.Pause' : 'Game.UI.Unpause')}
            <br/>
            {T.translate(!gamePaused ? 'Game.UI.Pause_Desc' : 'Game.UI.Unpause_Desc')}
          </span>)}>
          <IconButton raised
                      disabled={!isPlayer}
                      onClick={$wantsPauseRequest(!wantsPause)}
                      name={!wantsPause ? 'pause' : 'play_arrow'}/>
        </Tooltip>
      </div>);
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
