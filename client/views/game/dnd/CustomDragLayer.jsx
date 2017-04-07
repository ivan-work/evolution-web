import React from 'react';
import { DragLayer } from 'react-dnd';
import { DND_ITEM_TYPE } from './DND_ITEM_TYPE';
import { Card } from '../Card.jsx';
import shallowequal from 'shallowequal';

class CustomDragLayer extends React.Component {
  shouldComponentUpdate(nextProps) {
    console.log(shallowequal(this.props, nextProps));
    return !shallowequal(this.props, nextProps);
  }

  renderItem(type, item) {
    return <Card card={item.card}/>;
    //return <div>Card</div>;
  }

  getItemStyles(props) {
    const { getSourceClientOffset } = props;
    console.trace('getStyles')
    if (!getSourceClientOffset) {
      return {
        display: 'none'
      };
    }

    //console.table([
    //  props.getInitialClientOffset
    //  , props.getInitialSourceClientOffset
    //  , props.getClientOffset
    //  , props.getDifferenceFromInitialOffset
    //  , props.getSourceClientOffset
    //]);

    const clientOffset = {
      x: props.getClientOffset.x
      , y: props.getClientOffset.y
    };

    const { x, y } = clientOffset;
    const transform = `translate(${x}px, ${y}px)`;
    //console.log('getStylesend', transform)
    return {
      background: 'red',
      transform: transform,
      WebkitTransform: transform
    };
  }

  render() {
    console.log('CDL render');
    const { item, itemType, isDragging } = this.props;

    //console.log('render', isDragging, itemType);

    //if (!isDragging) {
    //  return null;
    //}

    return (
      <div style={{position: 'absolute', zIndex: 5}}>
        <div style={this.getItemStyles(this.props)}>
          {isDragging ? this.renderItem(itemType, item) : null}
        </div>
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