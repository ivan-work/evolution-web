import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {List, Map} from 'immutable';
import * as MDL from 'react-mdl';

import {UserModel} from '~/shared/models/UserModel';
import {GameModelClient, PHASE} from '../../../shared/models/game/GameModel';
import {CardModel} from '~/shared/models/game/CardModel';

import {
  gameReadyRequest,
  gameDeployAnimalRequest,
  gameDeployTraitRequest,
  gameEndTurnRequest
} from '~/shared/actions/actions';
import {redirectTo} from '~/shared/utils'

import {Continent} from './Continent.jsx';
import {CardCollection} from './CardCollection.jsx';
import {Card, DragCard} from './Card.jsx';
import {DropTargetAnimal} from './Animal.jsx';

import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TestBackend from 'react-dnd-test-backend';

const DECK_POSITION = {left: '100%', top: '40%'};
const PLAYER_POSITION = {left: '10%', bottom: '0'};
const CARD_POSITIONS = {
  0: null
  , 1: {
    deck: DECK_POSITION
    , player: PLAYER_POSITION
  }
  , 2: {
    deck: DECK_POSITION
    , player: PLAYER_POSITION
    , 0: {top: '0', left: '0'}
  }
  , 3: {
    deck: DECK_POSITION
    , player: PLAYER_POSITION
    , 0: {top: 0, left: '50%'}
    , 1: {top: 0, left: '50%'}
  }
  , 4: {
    deck: DECK_POSITION
    , player: PLAYER_POSITION
    , 0: {top: 0, left: '50%'}
    , 1: {top: 0, left: '50%'}
    , 2: {top: 0, left: '50%'}
  }
};

export class Game extends React.Component {
  static propTypes = {
    user: React.PropTypes.instanceOf(UserModel).isRequired
    , game: React.PropTypes.instanceOf(GameModelClient)
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    if (this.props.game && !this.props.game.started) this.props.$ready();
  }

  render() {
    const user = this.props.user;
    const game = this.props.game;

    if (!user || !game) return <div>Loading</div>;
    const disabled = game.status.player != game.getPlayer().index;
    const player = game.getPlayer();

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
                    raised disabled={disabled}
                    onClick={this.props.$endTurn}>EndTurn</MDL.Button>

        <CardCollection
          ref="Deck" name="Deck"
          shift={[1, 2]}>
          {game.deck.toArray().map((cardModel, i) => <Card model={cardModel} key={i} index={i}/>)}
        </CardCollection>
      </div>

      {/* USER */}

      <div className='PlayerWrapper UserWrapper' style={CARD_POSITIONS[game.players.size].player}>
        <Continent isUserContinent={true} continent={player.continent} $deployAnimal={this.props.$deployAnimal} $deployTrait={this.props.$deployTrait}/>

        <CardCollection
          ref="Hand" name="Hand"
          shift={[55, 0]}>
          {player.hand.toArray().map((cardModel, i) =>
          <DragCard model={cardModel} key={cardModel} index={i} disabled={disabled}/>)}
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
            <Continent continent={enemy.continent} $deployTrait={this.props.$deployTrait}/>
          </div>
          })
        }
    </div>;
  }
}

const backend = !process.env.TEST ? HTML5Backend : TestBackend;
export const DDCGame = DragDropContext(backend)(Game);

export const GameView = connect(
  (state) => {
    const game = state.get('game');
    const user = state.get('user');
    return {game, user}
  }
  , (dispatch) => ({
    $ready: () => dispatch(gameReadyRequest())
    , $deployAnimal: (...args) => dispatch(gameDeployAnimalRequest(...args))
    , $deployTrait: (...args) => dispatch(gameDeployTraitRequest(...args))
    , $endTurn: () => dispatch(gameEndTurnRequest())
  })
)(DDCGame);