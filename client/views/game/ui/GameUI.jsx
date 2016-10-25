import {PropTypes} from 'react';
import RIP from 'react-immutable-proptypes';

import {GameProvider} from '../providers/GameProvider';

import {DeckWrapper} from '../cards/DeckWrapper.jsx';

export const GameUI = GameProvider(({game, player, isPlayerTurn}) => (
  <div className='GameUI'>
    <PlayersList game={game}/>

    {player.acted
      ? <MDL.Button id="Game$endTurn" colored raised
                    disabled={!isPlayerTurn}
                    style={{width: '100%'}}
                    onClick={this.context.gameActions.$endTurn}>End Turn</MDL.Button>
      : <MDL.Button id="Game$endTurn" accent raised
                    disabled={!isPlayerTurn}
                    style={{width: '100%'}}
                    onClick={this.context.gameActions.$endTurn}>End Phase</MDL.Button>}

    <GameStatusDisplay status={game.status} players={game.players}/>

    <DeckWrapper deck={game.deck}/>
  </div>));

GameUI.propTypes = {
  // by GameProvider
  game: PropTypes.object
  , player: PropTypes.object
  , isPlayerTurn: PropTypes.bool
  , currentUserId: PropTypes.string
  , isDeploy: PropTypes.bool
  , isFeeding: PropTypes.bool
};