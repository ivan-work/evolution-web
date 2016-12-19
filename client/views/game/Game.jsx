import React from 'react';
import {GAME_POSITIONS} from './GAME_POSITIONS';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Button} from 'react-mdl';
import cn from 'classnames';

import {GameModelClient, PHASE} from '../../../shared/models/game/GameModel';

import {Portal} from '../utils/Portal.jsx';
import {ControlGroup} from '../utils/ControlGroup.jsx';
import {GameFoodContainer} from './food/GameFoodContainer.jsx';
import CustomDragLayer from './dnd/CustomDragLayer.jsx';
import {DeckWrapper} from './cards/DeckWrapper.jsx';
import GamePlayers from './GamePlayers.jsx';

import {GameScoreboardFinalView} from './ui/GameScoreboardFinal.jsx';

//const MaxWidth

class Game extends React.Component {
  static contextTypes = {
    gameActions: React.PropTypes.object
  };

  static propTypes = {
    game: React.PropTypes.instanceOf(GameModelClient).isRequired
  };

  constructor(props) {
    super(props);
    //this.shouldCmponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {game} = this.props;

    return <div className='Game'>
      <Portal target='header'>
        <ControlGroup name='Game'>
          <Button id="Game$exit" onClick={this.context.gameActions.$exit}>Exit</Button>
          <GameScoreboardFinalView/>
        </ControlGroup>
      </Portal>

      <Portal target='deck'>
        <DeckWrapper deck={game.deck}/>
      </Portal>

      <div style={{
        position: 'absolute'
        , left: '50%'
        , top: '50%'
      }}>
        {game.status.phase === PHASE.FEEDING &&
        <GameFoodContainer food={game.food}/>}
      </div>

      <GamePlayers game={game}/>

      <CustomDragLayer />
    </div>;
  }
}

export default Game;