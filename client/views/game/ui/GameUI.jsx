import React, {PropTypes} from 'react';
import T from 'i18n-react';
import RIP from 'react-immutable-proptypes';

import {GameProvider} from '../providers/GameProvider.jsx';

import {PortalTarget} from '../../utils/PortalTarget.jsx';
import {Button} from 'react-mdl';
import {PlayersList} from './PlayersList.jsx';
import {GameStatusDisplay} from './GameStatusDisplay.jsx';
import TraitDefenceDialog from './TraitDefenceDialog.jsx';
import Chat from '../../Chat.jsx';

class _GameUI extends React.Component {
  static displayName = 'GameUI';

  static contextTypes = {
    gameActions: React.PropTypes.object
  };

  constructor(props) {
    super(props);
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {game} = this.props;
    return (
      <div className='GameUI'>
        <TraitDefenceDialog game={game} $traitDefenceAnswer={this.context.gameActions.$traitDefenceAnswer}/>

        <PlayersList game={game}/>

        {game.getPlayer() &&
        <Button id="Game$endTurn" colored={game.getPlayer().acted} accent={!game.getPlayer().acted} raised
                disabled={!game.isPlayerTurn()}
                style={{width: '100%'}}
                onClick={this.context.gameActions.$endTurn}>
          {T.translate(game.getPlayer().acted ? 'Game.UI.EndTurn' : 'Game.UI.EndPhase')}
        </Button>}

        <GameStatusDisplay game={game}/>

        <div style={{height: '140px'}}>
          <PortalTarget name='deck'/>
        </div>

        <Chat chatTargetType='ROOM' roomId={game.roomId}/>
      </div>);
  }
}

export const GameUI = GameProvider(_GameUI);

//export const GameUI = GameProvider(({game, isPlayerTurn}) =>;

GameUI.propTypes = {
  // by GameProvider
  game: PropTypes.object
};