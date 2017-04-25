import React from 'react';
import PropTypes from 'prop-types'
import classnames from 'classnames';

import { DropTarget } from 'react-dnd';
import { DND_ITEM_TYPE } from '../dnd/DND_ITEM_TYPE';

export class ContinentZone extends React.PureComponent {
  static propTypes = {
    index: PropTypes.number.isRequired
    //, width: PropTypes.string.isRequired
    , onCardDropped: PropTypes.func.isRequired
  };
  render() {
    const {isOver} = this.props;
    return this.props.connectDropTarget(<div className={classnames({
      ContinentZone: true
      , highlight: isOver
    })}><div className="inner"></div>
    </div>);
  }
}

export const DropTargetContinentZone = DropTarget(DND_ITEM_TYPE.CARD, {
  drop(props, monitor, component) {
    const {card} = monitor.getItem();
    props.onCardDropped(card, props.index);
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(ContinentZone);