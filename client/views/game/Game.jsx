import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as MDL from 'react-mdl';
import cn from 'classnames';

import {UserModel} from '../../../shared/models/UserModel';
import {GameModelClient, PHASE} from '../../../shared/models/game/GameModel';

import {GAME_POSITIONS} from './GAME_POSITIONS';

import {GameUI} from './ui/GameUI.jsx';

import {Portal} from '../utils/Portal.jsx';
import {BodyPortal} from '../utils/BodyPortal.jsx';
import {ControlGroup} from '../utils/ControlGroup.jsx';
import {GameProvider} from './providers/GameProvider.jsx';
import {CardCollection} from './CardCollection.jsx';
import {Card, DragCard} from './Card.jsx';
import {ContinentDeploy} from './continent/ContinentDeploy.jsx';
import {ContinentFeeding} from './continent/ContinentFeeding.jsx';
import {GameFoodContainer} from './food/GameFoodContainer.jsx';
import CustomDragLayer from './dnd/CustomDragLayer.jsx';


import {GameScoreboardFinalView} from './ui/GameScoreboardFinal.jsx';

import {AnimationServiceContext, AnimationServiceRef} from '../../services/AnimationService';
import * as GameAnimations from './GameAnimations';

class _Game extends React.Component {
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
    const isPlayerTurn = game.isPlayerTurn();

    const GameContinent = (game.status.phase === PHASE.DEPLOY
      ? ContinentDeploy
      : ContinentFeeding);

    const gameClassName = cn({
      Game: true
      , isPlayerTurn
    });

    //<BodyPortal>
    //  <ReactCSSTransitionGroup transitionName="example">
    //    <div className='GameToast'><div className='inner'>Your turn!</div></div>
    //  </ReactCSSTransitionGroup>
    //</BodyPortal>
    return <div id='game' style={{display: 'flex'}}>
      <GameUI/>

      <div className={gameClassName}>
        <Portal target='header'>
          <ControlGroup name='Game'>
            <MDL.Button id="Game$exit" onClick={this.context.gameActions.$exit}>Exit</MDL.Button>
            <GameScoreboardFinalView/>
          </ControlGroup>
        </Portal>

        <div style={GAME_POSITIONS[game.players.size].food}>
          {game.status.phase === PHASE.FEEDING &&
          <GameFoodContainer food={game.food} />}
        </div>

        {this.renderUser(game, player, GameContinent)}

        {this.renderEnemies(game, player, GameContinent)}

        <CustomDragLayer />
      </div>
    </div>;
  }

  refCard(cardModel) {
    return (component) => {
      const Cards = this.props.getRef('Cards') || {};
      Cards[cardModel.id] = component;
      this.props.connectRef('Cards')(Cards);
    }
  }

  renderUser(game, player, GameContinent) {
    const dragEnabled = game.status.phase === PHASE.DEPLOY
      && game.isPlayerTurn();

    return <div className='PlayerWrapper UserWrapper' style={GAME_POSITIONS[game.players.size].player}>
      <GameContinent
        isUserContinent={true}
        continent={player.continent}
      />

      <CardCollection
        name="Hand"
        shift={[65, 0]}>
        {player.hand.toArray().map((cardModel, i) =>
        <DragCard
          key={cardModel}
          card={cardModel}
          ref={this.refCard(cardModel)}
          dragEnabled={dragEnabled}/>
          )}
      </CardCollection>
    </div>;
  }

  renderEnemies(game, player, GameContinent) {
    return game.players.valueSeq()
      .filter(enemy => enemy.id !== player.id)
      .map((enemy, i) => {
        return <div className='PlayerWrapper EnemyWrapper' key={enemy.id}
                    style={GAME_POSITIONS[game.players.size][i]}>
          <CardCollection
            name={enemy.id}
            shift={[20, 0]}>
            {enemy.hand.toArray().map((cardModel, i) =>
            <Card
              key={i}
              card={cardModel}
              ref={this.refCard(cardModel)}
            />)}
          </CardCollection>

          <GameContinent
            continent={enemy.continent}
          />
        </div>
      })
  }
}

export const Game = GameProvider(AnimationServiceContext({
  animations: ({getRef}) => ({
    gameGiveCards: (done, {game}, {cards}) => {
      GameAnimations.gameGiveCards(done, game, cards, getRef('Deck'), getRef('Cards'));
    }
//, gameNextPlayer: (done, component, {cards}) => {
    //  component.setState({
    //    toastYourTurn: true
    //  });
    //  setTimeout(() => {
    //    done();
    //  }, 5000);
    //}
    //onlineUpdate: (done, component) => {
    //  const {game} = component.props;
    //  GameAnimations.gameGiveCards(done, game, game.getPlayer().hand, component.Deck, component.Cards);
    //}
    //,
  })
})(AnimationServiceRef(_Game)));