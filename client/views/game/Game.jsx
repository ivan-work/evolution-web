import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as MDL from 'react-mdl';
import cn from 'classnames';

import {UserModel} from '../../../shared/models/UserModel';
import {GameModelClient, PHASE} from '../../../shared/models/game/GameModel';

import {GAME_POSITIONS} from './GAME_POSITIONS';
import {Portal} from '../utils/Portal.jsx';
import {BodyPortal} from '../utils/BodyPortal.jsx';
import {PortalTarget} from '../utils/PortalTarget.jsx';
import {ControlGroup} from '../utils/ControlGroup.jsx';
import {GameProvider} from './providers/GameProvider.jsx';
import {CardCollection} from './CardCollection.jsx';
import {Card, DragCard} from './Card.jsx';
import {ContinentDeploy} from './ContinentDeploy.jsx';
import {ContinentFeeding} from './ContinentFeeding.jsx';
import {GameFoodContainer} from './food/GameFoodContainer.jsx';
import CustomDragLayer from './dnd/CustomDragLayer.jsx';

import {GameScoreboardFinalView} from './ui/GameScoreboardFinal.jsx';
import {GameStatusDisplay} from './ui/GameStatusDisplay.jsx';
import {PlayersList} from './ui/PlayersList.jsx';

import {AnimationService, AnimationServiceHOC} from '../../services/AnimationService';
import * as GameAnimations from './GameAnimations';

class _Game extends React.Component {
  static contextTypes = {
    gameActions: React.PropTypes.object
    , game: React.PropTypes.instanceOf(GameModelClient)
  };

  static propTypes = {
    user: React.PropTypes.instanceOf(UserModel).isRequired
    , game: React.PropTypes.instanceOf(GameModelClient)
  };

  constructor(props) {
    super(props);
    this.Cards = {};
    this.CardCollections = {};
    //this.shouldCmponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
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

        {this.renderDeck(game)}
      </div>

      <div className={gameClassName}>
        <Portal target='header'>
          <ControlGroup name='Game'>
            <MDL.Button id="Game$exit" onClick={this.context.gameActions.$exit}>Exit</MDL.Button>
            <GameScoreboardFinalView/>
          </ControlGroup>
        </Portal>

        <div style={GAME_POSITIONS[game.players.size].food}>
          {game.status.phase === PHASE.FEEDING &&
          <GameFoodContainer food={game.food}/>}
        </div>

        {this.renderUser(game, player, GameContinent)}

        {this.renderEnemies(game, player, GameContinent)}

        <CustomDragLayer />
      </div>
    </div>;
  }

  renderDeck(game) {
    return <div className='DeckWrapper'>
      <h6>Deck ({game.deck.size}):</h6>
      <CardCollection
        name="Deck" ref={(component) => this.Deck = component}
        shift={[2, 1]}>
        {game.deck.toArray().map((cardModel, i) => <Card card={cardModel} key={i} index={i}/>)}
      </CardCollection>
    </div>
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
        name="Hand" ref={(component) => this.CardCollections[player.id] = component}
        shift={[65, 0]}>
        {player.hand.toArray().map((cardModel, i) =>
        <DragCard
          key={cardModel}
          card={cardModel}
          ref={(component) => this.Cards[cardModel.id] = component}
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
              ref={(component) => this.Cards[cardModel.id] = component}
            />)}
          </CardCollection>

          <GameContinent
            continent={enemy.continent}
          />
        </div>
      })
  }
}

export const Game = GameProvider(AnimationServiceHOC({
  animations: {
    gameGiveCards: (done, component, {cards}) => {
      const {game} = component.props;
      GameAnimations.gameGiveCards(done, game, cards, component.Deck, component.Cards);
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
  }
})(_Game));