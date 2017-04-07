import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import * as MDL from 'react-mdl';
import {connect} from 'react-redux';
import {Map} from 'immutable';

import {
  roomExitRequest
  , gameEndTurnRequest
  , gameReadyRequest
  , gameDeployAnimalRequest
  , gameDeployTraitRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '~/shared/actions/actions';

import {Game} from './Game.jsx';
import {GameModelClient} from '../../../shared/models/game/GameModel';

import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TestBackend from 'react-dnd-test-backend';

export class GameWrapper extends React.Component {
  static childContextTypes = {
    game: React.PropTypes.instanceOf(GameModelClient)
    , gameActions: React.PropTypes.object
  };

  getChildContext() {
    return {
      game: this.props.game
      , gameActions: {
        $endTurn: this.props.$endTurn
        , $ready: this.props.$ready
        , $deployAnimal: this.props.$deployAnimal
        , $deployTrait: this.props.$deployTrait
        , $traitTakeFood: this.props.$traitTakeFood
        , $traitActivate: this.props.$traitActivate
      }
    };
  }

  constructor(props) {
    super(props);
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  componentDidMount() {
    if (!this.ready && this.props.game) {
      this.ready = true;
      this.props.$ready();
    }
  }

  render() {
    const user = this.props.user;
    const game = this.props.game;

    const gameView = (!user || !game || game.status.phase === 0)
      ? <div>Loading</div>
      : <Game user={user}/>;

    return <div>
      <MDL.Button className="ExitGame" raised
                  onClick={this.props.$exit}>Exit Game</MDL.Button>
      {gameView}
    </div>;
  }
}

const backend = !process.env.TEST ? HTML5Backend : TestBackend;
export const DnDContextGameWrapper = DragDropContext(backend)(GameWrapper);

export const GameWrapperView = connect(
  (state) => {
    //console.log('state', state.toJS())
    const game = state.get('game');
    const user = state.get('user');
    return {game, user}
  }
  , (dispatch) => ({
    // GLOBAL
    $endTurn: () => dispatch(gameEndTurnRequest())
    , $exit: () => dispatch(roomExitRequest())
    // PHASE.PREPARE
    , $ready: () => dispatch(gameReadyRequest())
    // PHASE.DEPLOY
    , $deployAnimal: (...args) => dispatch(gameDeployAnimalRequest(...args))
    , $deployTrait: (...args) => dispatch(gameDeployTraitRequest(...args))
    // PHASE.FEEDING
    , $traitTakeFood: (...args) => dispatch(traitTakeFoodRequest(...args))
    , $traitActivate: (...args) => dispatch(traitActivateRequest(...args))
  })
)(DnDContextGameWrapper);