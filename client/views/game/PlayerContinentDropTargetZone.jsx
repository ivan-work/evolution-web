import React from 'react';
import Immutable from 'immutable';
import { DropTarget } from 'react-dnd';

export class PlayerContinentDropTargetZone extends React.Component {
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
    return this.props.connectDropTarget(<div className="PlayerContinentDropTargetZone" style={{width}}>
    </div>);
  }
}

export const DropTargetPlayerContinentDropTargetZone = DropTarget("Card", {
  drop(props, monitor, component) {
    const {model, position} = monitor.getItem();
    props.onCardDropped(model, props.index);
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(PlayerContinentDropTargetZone);