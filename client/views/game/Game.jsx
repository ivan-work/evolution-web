import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as MDL from 'react-mdl';
import cn from 'classnames';

import {UserModel} from '../../../shared/models/UserModel';
import {GameModelClient, PHASE} from '../../../shared/models/game/GameModel';

import {GAME_POSITIONS} from './GAME_POSITIONS';

import {Portal} from '../utils/Portal.jsx';
import {ControlGroup} from '../utils/ControlGroup.jsx';
import {GameProvider} from './providers/GameProvider.jsx';
import {CardCollection} from './CardCollection.jsx';
import {Card, DragCard} from './Card.jsx';
import {ContinentDeploy} from './continent/ContinentDeploy.jsx';
import {ContinentFeeding} from './continent/ContinentFeeding.jsx';
import {GameFoodContainer} from './food/GameFoodContainer.jsx';
import CustomDragLayer from './dnd/CustomDragLayer.jsx';
import {DeckWrapper} from './cards/DeckWrapper.jsx';


import {GameScoreboardFinalView} from './ui/GameScoreboardFinal.jsx';

import {AnimationServiceContext, AnimationServiceRef} from '../../services/AnimationService';

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
    this.refCard = this.refCard.bind(this);
  }

  render() {
    const {game} = this.props;
    const player = game.getPlayer();

    const GameContinent = (game.status.phase === PHASE.DEPLOY
      ? ContinentDeploy
      : ContinentFeeding);

    return <div className='Game'>
      <Portal target='header'>
        <ControlGroup name='Game'>
          <MDL.Button id="Game$exit" onClick={this.context.gameActions.$exit}>Exit</MDL.Button>
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

      {this.renderPlayer(game, player, GameContinent)}

      {game.players.valueSeq()
        .filter(enemy => enemy.id !== player.id)
        .map((enemy, index) => this.renderPlayer(game, enemy, GameContinent, index))}

      <CustomDragLayer />
    </div>;
  }

  refCard(cardModel) {
    return (component) => {
      const Cards = this.props.getRef('Cards') || {};
      Cards[cardModel.id] = component;
      this.props.connectRef('Cards')(Cards);
    }
  }

  renderPlayer(game, player, GameContinent, index) {
    const isUser = game.getPlayer().id === player.id;

    const dragEnabled = isUser
      && game.status.phase === PHASE.DEPLOY
      && game.isPlayerTurn();

    const playerWrapperClassName = cn({
      PlayerWrapper: true
      , UserWrapper: isUser
      , EnemyWrapper: !isUser
    });

    const playerWrapperStyle = (isUser
      ? GAME_POSITIONS[game.players.size].player
      : GAME_POSITIONS[game.players.size][index]);

    return <div className={playerWrapperClassName} style={playerWrapperStyle} key={player.id} data-player-id={player.id}>
      <GameContinent
        isUserContinent={isUser}
        continent={player.continent}
      />

      <CardCollection
        name={isUser ? 'Hand' : player.id}
        shift={[isUser ? 65 : 20, 0]}>
        {player.hand.toArray().map((cardModel, i) =>
        <DragCard
          key={cardModel.id}
          card={cardModel}
          ref={this.refCard(cardModel)}
          dragEnabled={dragEnabled}/>
          )}
      </CardCollection>
    </div>;
  }
}

export const Game = GameProvider(AnimationServiceRef(ReactGame));