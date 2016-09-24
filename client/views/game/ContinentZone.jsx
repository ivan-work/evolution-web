import React from 'react';
import Immutable from 'immutable';
import { DropTarget } from 'react-dnd';

export class ContinentZone extends React.Component {
  static propTypes = {
    width: React.PropTypes.string.isRequired
    , index: React.PropTypes.number.isRequired
    , onOver: React.PropTypes.func.isRequired
  };

  componentWillReceiveProps(nextProps) {
    const {index, isOver} = nextProps;
    nextProps.onOver(index, isOver);
  }

  render() {
    const {width} = this.props;
    return this.props.connectDropTarget(<div className="ContinentZone" style={{width}}>
    </div>);
  }
}

export const DropTargetContinentZone = DropTarget("Card", {
  drop(props, monitor, component) {
    const {card} = monitor.getItem();
    props.onCardDropped(card, props.index);
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(ContinentZone);