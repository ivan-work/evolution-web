import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {List, Map} from 'immutable';

import {UserModel} from '~/shared/models/UserModel';
import {GameModelClient} from '~/shared/models/game/GameModel';
import {CardModel} from '~/shared/models/game/CardModel';

import {gameReadyRequest, gamePlayCard} from '~/shared/actions/actions';
import {redirectTo} from '~/shared/utils'

import {EnemyContinent} from './EnemyContinent.jsx';
import {PlayerContinent} from './PlayerContinent.jsx';
import {CardCollection} from './CardCollection.jsx';
import {Card, UnknownCard, DragCard} from './Card.jsx';
import {DropTargetAnimal} from './Animal.jsx';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TestBackend from 'react-dnd-test-backend';

const DECK_POSITION = {right: '0', top: '40%'};
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
    this.cardPlayed = this.cardPlayed.bind(this)
  }

  componentDidMount() {
    if (this.props.game && !this.props.game.started) this.props.$ready();
  }

  cardPlayed(model, ...data) {
    this.props.$playCard(model.id, ...data);
  }

  render() {
    const user = this.props.user;
    const game = this.props.game;

    if (!user || !game) return <div>Loading</div>;
    const player = game.getPlayer();
    //console.log('GameRender: =====')
    //console.log('game', player.continent.toJS())
    //console.log('game', CARD_POSITIONS[game.players.size], game.players.size)
    return <div className="Game">

      <!-- DECK-->

      <div className='DeckWrapper' style={CARD_POSITIONS[game.players.size].deck}>
        <CardCollection
          ref="Deck" name="Deck"
          shift={[1, 2]}
          count={game.deck}>
          {Array.from({length: game.deck}, (u, i) => <UnknownCard key={i} index={i}/>)}
        </CardCollection>
      </div>

      <!-- USER -->

      <div className='PlayerWrapper UserWrapper' style={CARD_POSITIONS[game.players.size].player}>
        <PlayerContinent onCardDropped={this.cardPlayed}>
          {player.continent.toArray().map((animal, i) => <DropTargetAnimal index={i} key={i} model={animal} onCardDropped={this.cardPlayed}/>)}
        </PlayerContinent>

        <CardCollection
          ref="Hand" name="Hand"
          shift={[55, 0]}>
          {player.hand.toArray().map((cardModel, i) => <DragCard model={cardModel} key={cardModel} index={i}/>)}
        </CardCollection>
      </div>

      <!-- ENEMIES -->

      {
        game.players.valueSeq()
          .filter(enemy => enemy.id !== user.id)
          .map((enemy, i) => {
          return <div className='PlayerWrapper EnemyWrapper' key={enemy.id} style={CARD_POSITIONS[game.players.size][i]}>
            <CardCollection
              ref={enemy.id} name={enemy.id}
              shift={[20, 0]}>
              {enemy.hand.toArray().map((cardModel, i) => <Card model={cardModel} key={i} index={i}/>)}
            </CardCollection>
            <EnemyContinent>
              {enemy.continent.toArray().map((animal, i) => <DropTargetAnimal key={i} index={i} onCardDropped={this.cardPlayed}/>)}
            </EnemyContinent>
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
    , $playCard: (...args) => dispatch(gamePlayCard(...args))
  })
)(DDCGame);