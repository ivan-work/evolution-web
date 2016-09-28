import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';

import {PHASE} from '../../../shared/models/game/GameModel';
import {ContinentPhaseDeploy} from './ContinentPhaseDeploy.jsx';

import {
  gameEndTurnRequest
  , gameReadyRequest
  , gameDeployAnimalRequest
  , gameDeployTraitRequest
  , traitTakeFoodRequest
  , traitActivateRequest
} from '~/shared/actions/actions';

import {Game} from './Game.jsx';

import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TestBackend from 'react-dnd-test-backend';

export class GameWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.makeContinent = this.makeContinent.bind(this);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    if (this.props.game && !this.props.game.started) this.props.$ready();
  }

  makeContinent(continent, isUserContinent) {
    switch (this.props.game.status.phase) {
      case PHASE.DEPLOY:
        return <ContinentPhaseDeploy
          isUserContinent={isUserContinent}
          continent={continent}
          $deployAnimal={this.props.$deployAnimal}
          $deployTrait={this.props.$deployTrait}
        />
    }
  }

  render () {
    const user = this.props.user;
    const game = this.props.game;

    if (!user || !game) return <div>Loading</div>;

    return <Game user={user} game={game} $endTurn={this.props.$endTurn} makeContinent={this.makeContinent}/>;
  }
}

const backend = !process.env.TEST ? HTML5Backend : TestBackend;
export const DnDContextGameWrapper = DragDropContext(backend)(GameWrapper);

export const GameWrapperView = connect(
  (state) => {
    const game = state.get('game');
    const user = state.get('user');
    return {game, user}
  }
  , (dispatch) => ({
    // GLOBAL
    $endTurn: () => dispatch(gameEndTurnRequest())
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