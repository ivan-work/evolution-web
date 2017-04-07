import React from 'react';
import Immutable from 'immutable';
import { DropTarget } from 'react-dnd';

export class PlayerContinentDropTargetZone extends React.Component {
  render() {
    return this.props.connectDropTarget(<div className="PlayerContinentDropTargetZone" style={{width: this.props.width}}>
    </div>);
  }
}

export const DropTargetPlayerContinentDropTargetZone = DropTarget("Card", {
  drop(props, monitor, component) {
    const {model, position} = monitor.getItem();
    console.log('drop registered')
    props.onCardDropped(model, position, props.position);
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(PlayerContinentDropTargetZone);