import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {List, Map} from 'immutable';

import * as MDL from 'react-mdl';

import {UserModel} from '~/shared/models/UserModel';
import {GameModelClient} from '~/shared/models/game/GameModel';
import {gameReadyRequest} from '~/shared/actions/actions';

import {CardCollection} from './CardCollection.jsx';

import {redirectTo} from '~/shared/utils'

const CARD_POSITIONS = {
  0: null
  , 1: null
  , 2: {
    deck: {left: '50%', top: '50%'}
    , player: {left: '50%', bottom: 0}
    , 0: {top: 0, left: '50%'}
  }
  , 3: {
    deck: {right: 0, top: 0}
    , player: {left: '50%', bottom: 0}
    , 0: {top: 0, left: '50%'}
    , 1: {top: 0, left: '50%'}
  }
  , 4: {
    deck: {right: 0, top: 0}
    , player: {left: '50%', bottom: 0}
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
    //console.log('game did mount');
    this.props.$ready();
  }

  render() {
    const user = this.props.user;
    const game = this.props.game;
    //console.log('GameRender: =====')
    //console.log('game', game.toJS())
    return <div className="Game">
      <CardCollection
        ref="Deck" name="Deck"
        position={CARD_POSITIONS[game.players.size].deck}
        shift={[1, 2]}
        count={game.deck}/>
      <CardCollection
        ref="Hand" name="Hand"
        position={CARD_POSITIONS[game.players.size][0]}
        shift={[10, 10]}
        cards={game.hand}/>
      {
        game.players.valueSeq()
          .filter(player => player.id !== user.id)
          .map((player, i) => {
          return <CardCollection
            ref={player.id} name={player.id} key={player.id}
            position={CARD_POSITIONS[game.players.size][i]}
            shift={[-25, 1]}
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