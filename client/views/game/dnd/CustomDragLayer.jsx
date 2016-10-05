import React from 'react';
import { DragLayer } from 'react-dnd';
import { DND_ITEM_TYPE } from './DND_ITEM_TYPE';
import { Card, DragCardPreview } from '../Card.jsx';

const layerStyles = {
  position: 'fixed',
  zIndex: 5,
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%'
};

class CustomDragLayer extends React.Component {
  constructor(props) {
    super(props);
    this.animationCounter = 0;
  }

  renderItem(type, item, dragProps) {
    switch (type) {
      case DND_ITEM_TYPE.CARD:
        return <DragCardPreview card={item.card} {...dragProps}/>;
      case DND_ITEM_TYPE.TRAIT:
      //return <Card card={item.card}/>;
    }
  }

  render() {
    const { item, itemType, isDragging } = this.props;
    const offset = this.props.getSourceClientOffset;

    this.animationCounter = item ? ++this.animationCounter : 0;

    const velocity = {x: 0, y: 0};
    if (offset) {
      if (this.previousOffset) {
        velocity.x = offset.x - this.previousOffset.x;
        velocity.y = offset.y - this.previousOffset.y;
      }
      this.previousOffset = offset;
    }

    const dragProps = {
      offset
      , velocity
      , afterStart: this.animationCounter > 2
    };

    return (
      <div style={layerStyles}>
        {this.animationCounter}
        {isDragging && offset ? this.renderItem(itemType, item, dragProps) : null}
      </div>
    );
  }
}

export default DragLayer((monitor) => ({
  item: monitor.getItem()
  , itemType: monitor.getItemType()
  , isDragging: monitor.isDragging()
  , getInitialClientOffset: monitor.getInitialClientOffset()
  , getInitialSourceClientOffset: monitor.getInitialSourceClientOffset()
  , getClientOffset: monitor.getClientOffset()
  , getDifferenceFromInitialOffset: monitor.getDifferenceFromInitialOffset()
  , getSourceClientOffset: monitor.getSourceClientOffset()
}))(CustomDragLayer);