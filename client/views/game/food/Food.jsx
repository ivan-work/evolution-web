import React, {Component, PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import './Food.scss';

import {GameProvider} from '../providers/GameProvider.jsx';

import { DragSource } from 'react-dnd';
import { DND_ITEM_TYPE } from '../dnd/DND_ITEM_TYPE';

import {TRAIT_COOLDOWN_LINK} from '../../../../shared/models/game/evolution/constants';

//const graphics = ['\u1F345']/*, '&#127814;', '&#127815;'
//  , '&#127816;', '&#127817;', '&#127818;', '&#127819;', '&#127820;'
//  , '&#127821;', '&#127822;', '&#127823;', '&#127824;', '&#127825;', '&#127826;', '&#127827;'];*/
//const getGraphics = () => graphics[Math.floor(Math.random() * graphics.length)];

class Food extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {canDrag, connectDragSource, isDragging} = this.props;

    const className = classnames({
      Food: true
      , 'material-icons': true
      , draggable: connectDragSource
      , canDrag
      , isDragging
    });

    return <div className={className}>spa</div>;
  }
}

class DragFood_Body extends Food {
  render() {
    const {connectDragSource} = this.props;
    return connectDragSource(super.render());
  }
}
DragFood_Body.displayName = 'Food';
DragFood_Body.propTypes = {
  connectDragSource: PropTypes.func.isRequired
  , canDrag: PropTypes.bool.isRequired
  , isDragging: PropTypes.bool.isRequired
};

const DragFood = DragSource(DND_ITEM_TYPE.FOOD
  , {
    beginDrag: (props) => ({index: props.index})
    , canDrag: ({game}, monitor) =>
    game.isPlayerTurn()
    && !game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, game.userId)
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
    , canDrag: monitor.canDrag()
  })
)(DragFood_Body);

DragFood.propTypes = {
  // by GameProvider
  game: PropTypes.object.isRequired
};

const GameDragFood = GameProvider(DragFood);

export {Food, GameDragFood as DragFood};