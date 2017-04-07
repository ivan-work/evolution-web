import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {GameProvider} from './providers/GameProvider.jsx';

import { DragSource } from 'react-dnd';
import { DND_ITEM_TYPE } from './dnd/DND_ITEM_TYPE';

import {TRAIT_COOLDOWN_LINK} from '../../../shared/models/game/evolution/constants';

export class Food extends React.Component {
  static propTypes = {
    index: React.PropTypes.number.isRequired
    , disabled: React.PropTypes.bool.isRequired
    // by GameProvider
    , game: React.PropTypes.object.isRequired
    , isUserTurn: React.PropTypes.bool.isRequired
    , currentUserId: React.PropTypes.string.isRequired
    , isDeploy: React.PropTypes.bool.isRequired
    , isFeeding: React.PropTypes.bool.isRequired
  };

  static defaultProps = {
    disabled: false
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {index, canDrag, connectDragSource, isDragging} = this.props;

    const className = classnames({
      Food: true
      , disabled: !canDrag
      , enabled: canDrag
      , isDragging: isDragging
    });

    const body = <div className={className}></div>;

    return connectDragSource ? connectDragSource(body) : body;
  }
}

export const DragFood = GameProvider(DragSource(DND_ITEM_TYPE.FOOD
  , {
    beginDrag: (props) => ({index: props.index})
    , canDrag: (props, monitor) => !props.disabled
      && props.isUserTurn
      && !props.game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, props.currentUserId, null)
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
    , canDrag: monitor.canDrag()
  })
)(Food));