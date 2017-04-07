import React, {PropTypes} from 'react';
import RIP from 'react-immutable-proptypes';

import {GameProvider} from '../providers/GameProvider.jsx';

import {PortalTarget} from '../../utils/PortalTarget.jsx';
import {Button} from 'react-mdl';
import {PlayersList} from './PlayersList.jsx';
import {GameStatusDisplay} from './GameStatusDisplay.jsx';
import {TraitDefenceDialog} from './TraitDefenceDialog.jsx';

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
    const {game, isPlayerTurn} = this.props;
    return (
      <div className='GameUI'>
        <TraitDefenceDialog game={game} $traitDefenceAnswer={this.context.gameActions.$traitDefenceAnswer}/>

        <PlayersList game={game}/>

        {game.getPlayer().acted
          ? <Button id="Game$endTurn" colored raised
                    disabled={!isPlayerTurn}
                    style={{width: '100%'}}
                    onClick={this.context.gameActions.$endTurn}>End Turn</Button>
          : <Button id="Game$endTurn" accent raised
                    disabled={!isPlayerTurn}
                    style={{width: '100%'}}
                    onClick={this.context.gameActions.$endTurn}>End Phase</Button>}

        <GameStatusDisplay game={game}/>

        <PortalTarget name='deck'/>
      </div>);
  }
}

export const GameUI = GameProvider(_GameUI);

//export const GameUI = GameProvider(({game, isPlayerTurn}) =>;

GameUI.propTypes = {
  // by GameProvider
  game: PropTypes.object
  , isPlayerTurn: PropTypes.bool
  , currentUserId: PropTypes.string
  , isDeploy: PropTypes.bool
  , isFeeding: PropTypes.bool
};