import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {List, Map} from 'immutable';

import * as MDL from 'react-mdl';

import {UserModel} from '~/shared/models/UserModel';
import {GameModelClient} from '~/shared/models/game/GameModel';
import {CardModel} from '~/shared/models/game/CardModel';
import {gameReadyRequest} from '~/shared/actions/actions';

import {CardCollection} from './CardCollection.jsx';

import {redirectTo} from '~/shared/utils'

const DECK_POSITION = {left: '50%', top: '50%'};
const PLAYER_POSITION = {left: '10%', bottom: '100px'};
const CARD_POSITIONS = {
  0: null
  , 1: null
  , 2: {
    deck: DECK_POSITION
    , player: PLAYER_POSITION
    , 0: {top: '80px', left: '50%', transform: 'rotate(180deg)'}
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
  }
};

export class Game extends React.Component {
  static propTypes = {
    user: React.PropTypes.instanceOf(UserModel).isRequired
    , game: React.PropTypes.instanceOf(GameModelClient).isRequired
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.ready)
      this.props.$ready();
  }

  render() {
    const user = this.props.user;
    const game = this.props.game;
    if (!user || !game) return <div>Loading</div>;
    this.ready = true;
    console.log('GameRender: =====')
    console.log('game', game.hand.toJS())
    return <div className="Game">
      <CardCollection
        ref="Deck" name="Deck"
        position={CARD_POSITIONS[game.players.size].deck}
        shift={[1, 2]}
        count={game.deck}/>
      <CardCollection
        ref="Hand" name="Hand"
        position={CARD_POSITIONS[game.players.size].player}
        shift={[0, 60]}
        cards={game.hand}/>
      {
        game.players.valueSeq()
          .filter(player => player.id !== user.id)
          .map((player, i) => {
          return <CardCollection
            ref={player.id} name={player.id} key={player.id}
            position={CARD_POSITIONS[game.players.size][i]}
            shift={[0, 10]}
            count={player.hand}/>
          })
        }
    </div>;
  }
}


//<MDL.Button raised colored onClick={this.props.actions.roomCreateRequest}>Create room</MDL.Button>

export const GameView = connect(
  (state) => {
    const game = state.get('game');
    const user = state.get('user');
    return {game, user}
  }
  , (dispatch) => ({
    $ready: () => dispatch(gameReadyRequest())
  })
)(Game);