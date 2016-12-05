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

import {AnimationServiceRef} from '../../services/AnimationService';

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
    const {game} = this.props;
    const player = game.getPlayer();

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

      {this.renderPlayer(game, player)}

      {game.players.valueSeq()
        .filter(enemy => enemy.id !== player.id)
        .map((enemy, index) => this.renderPlayer(game, enemy, index))}

      <CustomDragLayer />
    </div>;
  }

  renderPlayer(game, player, index) {
    const isUser = game.getPlayer().id === player.id;
    return (isUser ? (
      <div className={cn({PlayerWrapper: true, UserWrapper: true})}
           style={GAME_POSITIONS[game.players.size].player}
           key={player.id}
           data-player-id={player.id}>
        {this.renderContinent(game, player.continent, isUser)}
        {this.renderCardCollection(game, player, isUser)}
      </div>
    ) : (
      <div className={cn({PlayerWrapper: true, EnemyWrapper: true})}
           style={GAME_POSITIONS[game.players.size][index]}
           key={player.id}
           data-player-id={player.id}>
        <div className='InnerWrapper'>
          {this.renderCardCollection(game, player, isUser)}
          {this.renderContinent(game, player.continent, isUser)}
        </div>
      </div>
    ));
  }

  renderContinent(game, continent, isUser) {
    const ContinentClass = (game.status.phase === PHASE.DEPLOY
      ? ContinentDeploy
      : ContinentFeeding);

    return (<ContinentClass
      isUserContinent={isUser}
      continent={continent}
    />)
  }

  renderCardCollection(game, player, isUser) {
    const dragEnabled = isUser
      && game.status.phase === PHASE.DEPLOY
      && game.isPlayerTurn();

    return (<CardCollection
      name={isUser ? 'Hand' : player.id}
      shift={[isUser ? 55 : 20, 0]}>
      {player.hand.toArray().map((cardModel, i) =>
      <DragCard
        key={cardModel.id}
        card={cardModel}
        ref={this.props.connectRef('Card#'+cardModel.id)}
        dragEnabled={dragEnabled}/>
        )}
    </CardCollection>)
  }
}

export const Game = GameProvider(AnimationServiceRef(ReactGame));