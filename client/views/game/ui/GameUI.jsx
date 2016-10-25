import React, {PropTypes} from 'react';
import RIP from 'react-immutable-proptypes';

import {GameProvider} from '../providers/GameProvider';

import {Button} from 'react-mdl';
import {PlayersList} from './PlayersList.jsx';
import {GameStatusDisplay} from './GameStatusDisplay.jsx';
import {DeckWrapper} from '../cards/DeckWrapper.jsx';

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

        <GameStatusDisplay status={game.status} players={game.players}/>

        <DeckWrapper deck={game.deck}/>
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