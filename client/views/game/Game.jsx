import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
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
import {ContinentDeploy} from './ContinentDeploy.jsx';
import {ContinentFeeding} from './ContinentFeeding.jsx';
import {DragFood} from './Food.jsx';
import CustomDragLayer from './dnd/CustomDragLayer.jsx';
import {GameScoreboardFinalView} from './ui/GameScoreboardFinal.jsx';

import {UserService} from '../../services/UserService'

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
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {game} = this.props;
    const player = game.getPlayer();
    const isPlayerTurn = game.isPlayerTurn();

    const GameContinent = (game.status.phase === PHASE.DEPLOY
      ? ContinentDeploy
      : ContinentFeeding);

    return <div style={{display: 'flex'}}>
      <div style={{width: '200px'}}>
        <ul className='PlayersList'>
          <h6>Players:</h6>
          {game.getSortedPlayersByIndex()
            .map(player => {
            const user = UserService.get(player.id);
            const className = cn({
              Player: true
              , isPlayerTurn: game.isPlayerTurn(player.id)
              });
            //let status;
            //switch (player.status) {
            //  case 'READY':
            //
            //}
            return <li key={player.id} className={className}>
              {user.login} {player.index} {status}
            </li>})}
        </ul>

      </div>
      <div className="Game" style={{
      background: game.isPlayerTurn() ? '#dfd' : '#fdd'
    }}>
        <Portal target='header'>
          <ControlGroup name='Game'>
            <MDL.Button id="Game$exit" onClick={this.context.gameActions.$exit}>Exit</MDL.Button>
            <MDL.Button id="Game$endTurn" disabled={!isPlayerTurn}
                        onClick={this.context.gameActions.$endTurn}>EndTurn</MDL.Button>
          </ControlGroup>
        </Portal>

        {this.renderDeck(game)}

        {game.status.phase === PHASE.FEEDING ? <div className='GameFoodContainer' style={GAME_POSITIONS[game.players.size].food}>
          {Array.from({length: game.food}).map((u, index) => <DragFood key={index} index={index} disabled={!isPlayerTurn}/>)}
        </div>: null}

        {this.renderUser(game, player, GameContinent)}

        {this.renderEnemies(game, player, GameContinent)}

        <CustomDragLayer />
      </div>
    </div>;
  }

  renderDeck(game) {
    return <div className='DeckWrapper' style={GAME_POSITIONS[game.players.size].deck}>
      <div className="GameStatus">
        Turn: {game.status.turn}
        <br/> Phase: {game.status.phase}
        <br/> Round: {game.status.round}
        <br/> Player: {game.status.currentPlayer}
        <br/> RoundStarter: {game.status.roundPlayer}
      </div>

      <GameScoreboardFinalView/>

      <CardCollection
        ref="Deck" name="Deck"
        shift={[1, 2]}>
        {game.deck.toArray().map((cardModel, i) => <Card card={cardModel} key={i} index={i}/>)}
      </CardCollection>
    </div>
  }

  renderUser(game, player, GameContinent) {
    const GameCard = (game.status.phase === PHASE.DEPLOY
      ? DragCard
      : Card);

    return <div className='PlayerWrapper UserWrapper' style={GAME_POSITIONS[game.players.size].player}>
      <GameContinent
        isUserContinent={true}
        continent={player.continent}
      />

      <CardCollection
        ref="Hand" name="Hand"
        shift={[55, 0]}>
        {player.hand.toArray().map((cardModel, i) =>
        <GameCard card={cardModel} key={cardModel} index={i} disabled={!game.isPlayerTurn()}/>)}
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
            ref={enemy.id} name={enemy.id}
            shift={[20, 0]}>
            {enemy.hand.toArray().map((cardModel, i) => <Card card={cardModel} key={i} index={i}/>)}
          </CardCollection>

          <GameContinent
            continent={enemy.continent}
          />
        </div>
      })
  }
}

export const Game = GameProvider(_Game);