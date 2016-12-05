import React from 'react';
import {GAME_POSITIONS} from './GAME_POSITIONS';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Button} from 'react-mdl';
import cn from 'classnames';

import {UserModel} from '../../../shared/models/UserModel';
import {GameModelClient, PHASE} from '../../../shared/models/game/GameModel';

import {Portal} from '../utils/Portal.jsx';
import {ControlGroup} from '../utils/ControlGroup.jsx';
import {GameFoodContainer} from './food/GameFoodContainer.jsx';
import CustomDragLayer from './dnd/CustomDragLayer.jsx';
import {DeckWrapper} from './cards/DeckWrapper.jsx';
import GamePlayers from './GamePlayers.jsx';


import {GameScoreboardFinalView} from './ui/GameScoreboardFinal.jsx';

import {AnimationServiceRef} from '../../services/AnimationService';

//const MaxWidth

class ReactGame extends React.Component {
  static displayName = 'Game';

  static contextTypes = {
    gameActions: React.PropTypes.object
  };

  static propTypes = {
    user: React.PropTypes.instanceOf(UserModel).isRequired
    , game: React.PropTypes.instanceOf(GameModelClient)
  };

  constructor(props) {
    super(props);
    //this.shouldCmponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {game, connectRef} = this.props;

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

      <div style={GAME_POSITIONS[game.players.size].food}>
        {game.status.phase === PHASE.FEEDING &&
        <GameFoodContainer food={game.food}/>}
      </div>

      <GamePlayers game={game} connectRef={connectRef}/>

      <CustomDragLayer />
    </div>;
  }
}

export const Game = AnimationServiceRef(ReactGame);