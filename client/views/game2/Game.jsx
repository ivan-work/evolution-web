import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import {connect} from 'react-redux';
import {compose} from 'redux';

// shared
import {traitAnswerRequest} from '../../../shared/actions/actions';

// Animations
import {AnimationServiceContext} from '../../services/AnimationService';
import {createAnimationServiceConfig} from '../game/animations';

// DnD
import {DragDropContext} from 'react-dnd';
import TouchBackend from 'react-dnd-touch-backend';
import TestBackend from 'react-dnd-test-backend';
const backend = !process.env.TEST ? TouchBackend({enableMouseEvents: true}) : TestBackend;

import GameTimedOutDialog from './ui/GameTimedOutDialog.jsx'
import TraitIntellectDialog from './ui/TraitIntellectDialog.jsx'
import TraitDefenceDialog from '../game/ui/TraitDefenceDialog.jsx'

export class Game extends React.Component {
  render() {
    const {game, $traitAnswer} = this.props;
    return <div>
      <GameTimedOutDialog game={game}/>
      <TraitIntellectDialog game={game} $traitAnswer={$traitAnswer}/>
      <TraitDefenceDialog game={game} $traitAnswer={$traitAnswer}/>

      <div>PlayerCard</div>
      <div>UI</div>
      <div>EnemyCard</div>
      <div>EnemyCard</div>
      <div>EnemyCard</div>
      <div>EnemyCard</div>
      <div>EnemyCard</div>
      <div>EnemyCard</div>
      <div>EnemyCard</div>
    </div>
  }
}

export const GameView = compose(
  DragDropContext(backend)
  , AnimationServiceContext(createAnimationServiceConfig())
  , connect((state, props) => {
      const game = state.get('game');
      const user = state.get('user');
      const roomId = state.get('room');
      const room = state.getIn(['rooms', roomId]);
      return {game, user, roomId, room}
    }
    , (dispatch) => ({
      $traitAnswer: (...args) => dispatch(traitAnswerRequest(...args))
    })
  ))(Game);

export default GameView;