import React from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {Button, IconButton, Tooltip} from 'react-mdl';

import {gameSetUserWantsPauseRequest} from '../../../../shared/actions/actions';

export class Pause extends React.Component {
  static propTypes = {
    $wantsPauseRequest: React.PropTypes.func.isRequired
  };

  render() {
    const {isPlayer, wantsPause, gamePaused, $wantsPauseRequest} = this.props;

    return (
      <div>
        <Tooltip label={
          T.translate(wantsPause ? 'Game.UI.Pause' : 'Game.UI.Unpause')
          + ' ' + T.translate(!gamePaused ? 'Game.UI.Pause_Desc' : 'Game.UI.Unpause_Desc')
        }>
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
      , wantsPause: player && player.wantsPause
      , gamePaused: state.get('game').status.paused
    }
  }
  , (dispatch, props) => ({
    $wantsPauseRequest: (wantsPause) => () => dispatch(gameSetUserWantsPauseRequest(wantsPause))
  })
)(Pause);


PauseView.propTypes = {};

export default PauseView;
