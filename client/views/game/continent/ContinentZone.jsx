import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import { DropTarget } from 'react-dnd';
import { DND_ITEM_TYPE } from '../dnd/DND_ITEM_TYPE';

export class ContinentZone extends React.Component {
  static propTypes = {
    index: React.PropTypes.number.isRequired
    //, width: React.PropTypes.string.isRequired
    , onCardDropped: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

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