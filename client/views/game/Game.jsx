import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import * as MDL from 'react-mdl';

import {UserModel} from '~/shared/models/UserModel';
import {GameModelClient, PHASE} from '../../../shared/models/game/GameModel';

import {CARD_POSITIONS} from './CARD_POSITIONS';
import {CardCollection} from './CardCollection.jsx';
import {Card, DragCard} from './Card.jsx';
import {ContinentDeploy} from './ContinentDeploy.jsx';
import {ContinentFeeding} from './ContinentFeeding.jsx';
import {DragFood} from './Food.jsx';

export class Game extends React.Component {
  static contextTypes = {
    gameActions: React.PropTypes.object
  };

  static childContextTypes = {
    game: React.PropTypes.instanceOf(GameModelClient)
  };

  getChildContext() {
    return {
      game: this.props.game
    };
  }

  static propTypes = {
    user: React.PropTypes.instanceOf(UserModel).isRequired
    , game: React.PropTypes.instanceOf(GameModelClient)
    , makeContinent: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const user = this.props.user;
    const game = this.props.game;

    if (!user || !game) return <div>Loading</div>;
    const userTurn = game.status.player === game.getPlayer().index
    const player = game.getPlayer();

    const GameContinent = (game.status.phase === PHASE.DEPLOY
      ? ContinentDeploy
      : game.status.phase === PHASE.FEEDING
      ? ContinentFeeding
      : React.DOM.div);

    const GameCard = (game.status.phase === PHASE.DEPLOY
      ? DragCard
      : Card);

    return <div className="Game">

      {/* DECK */}
      <div className='DeckWrapper' style={CARD_POSITIONS[game.players.size].deck}>
        <div className="GameStatus">
          Turn: {game.status.turn}
          <br/> Phase: {game.status.phase}
          <br/> Round: {game.status.round}
          <br/> Player: {game.status.player}
        </div>

        <MDL.Button className="EndTurn"
                    raised disabled={!userTurn}
                    onClick={this.context.gameActions.$endTurn}>EndTurn</MDL.Button>

        <CardCollection
          ref="Deck" name="Deck"
          shift={[1, 2]}>
          {game.deck.toArray().map((cardModel, i) => <Card model={cardModel} key={i} index={i}/>)}
        </CardCollection>
      </div>

      {game.status.phase === PHASE.FEEDING ? <div className='GameFoodContainer'>
        {Array.from({length: game.food}).map((u, index) => <DragFood key={index} index={index} disabled={!userTurn}/>)}
      </div>: null}

      {/* USER */}
      <div className='PlayerWrapper UserWrapper' style={CARD_POSITIONS[game.players.size].player}>
        <GameContinent
          isUserContinent={true}
          continent={player.continent}
        />

        <CardCollection
          ref="Hand" name="Hand"
          shift={[55, 0]}>
          {player.hand.toArray().map((cardModel, i) =>
          <GameCard model={cardModel} key={cardModel} index={i} disabled={!userTurn}/>)}
        </CardCollection>
      </div>

      {/* ENEMIES */}

      {
        game.players.valueSeq()
          .filter(enemy => enemy.id !== user.id)
          .map((enemy, i) => {
          return <div className='PlayerWrapper EnemyWrapper' key={enemy.id}
                      style={CARD_POSITIONS[game.players.size][i]}>
            <CardCollection
              ref={enemy.id} name={enemy.id}
              shift={[20, 0]}>
              {enemy.hand.toArray().map((cardModel, i) => <Card model={cardModel} key={i} index={i}/>)}
            </CardCollection>

            <GameContinent
              continent={enemy.continent}
            />
          </div>
          })
        }
    </div>;
  }
}