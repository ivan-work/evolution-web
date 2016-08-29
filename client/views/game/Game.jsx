import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {List, Map} from 'immutable';

import * as MDL from 'react-mdl';

import {CardCollection} from './CardCollection.jsx';

import {roomExitRequest, roomStartGameRequest} from '~/shared/actions/actions';

const CARD_POSITIONS = [
  , Map({top: 0, left: '50%'})
];

export const Game = React.createClass({
  mixins: [PureRenderMixin]
  , render: function () {
    const user = this.props.user;
    const game = this.props.game;
    return <div className="Game">
      <CardCollection
        ref="Deck" name="Deck"
        position={Map({right: 0, top: 0})}
        shift={[-25, 1]}
        cards={game.deck}/>
      <CardCollection
        ref="Hand" name="Hand"
        position={Map({left: "50%", bottom: 0})}
        shift={List.of(-25, 1)}
        cards={game.hand}/>
      {
        game.players.valueSeq().map((player, i) => {
          if (player.id === user.id) return;
          return <CardCollection
            ref={player.id} name={player.id} key={player.id}
            position={CARD_POSITIONS[i]}
            shift={[-25, 1]}
            cards={game.hand}/>
          })
        }
    </div>;
  }
});

//<MDL.Button raised colored onClick={this.props.actions.roomCreateRequest}>Create room</MDL.Button>

export const GameView = connect(
  (state) => {
    const game = state.get('game');
    const user = state.get('user');
    return {game, user}
  }
  , (dispatch) => ({})
)(Game);