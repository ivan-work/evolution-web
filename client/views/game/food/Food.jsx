import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './Food.scss';

import { DragSource } from 'react-dnd';
import { DND_ITEM_TYPE } from '../dnd/DND_ITEM_TYPE';

import {TRAIT_COOLDOWN_LINK} from '../../../../shared/models/game/evolution/constants';

class Food extends React.PureComponent {
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
  game: PropTypes.object.isRequired
};

export {Food, DragFood};