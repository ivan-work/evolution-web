import React from 'react';
import { DragLayer } from 'react-dnd';
import { DND_ITEM_TYPE } from './DND_ITEM_TYPE';
import { Card, DragCardPreview } from '../Card.jsx';
import { AnimalTraitArrow } from '../AnimalTraitArrow.jsx';
import { Food } from '../Food.jsx';

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
        return <AnimalTraitArrow trait={item.trait} {...dragProps}/>;
      case DND_ITEM_TYPE.TRAIT:
        return <Food {...dragProps}/>;
    }
  }

  render() {
    const { item, itemType, isDragging } = this.props;
    const offset = this.props.getClientOffset;
    const initialOffset = this.props.getInitialSourceClientOffset;
    console.log(offset);
    console.log(initialOffset);

    this.animationCounter = item ? ++this.animationCounter : 0;

    const MAX_VELOCITY = 60;
    const VELOCITY = 8;
    const velocity = {x: 0, y: 0};
    //if (offset) {
    //  document.body.style.cursor = 'grabbing';
    //  document.body.style.cursor = '-webkit-grabbing';
    //  document.body.style.cursor = 'grabbing';
    //} else {
    //  document.body.style.cursor = '';
    //}
    if (offset) {
      if (this.previousOffset) {
        velocity.x = offset.x - this.previousOffset.x;
        velocity.y = offset.y - this.previousOffset.y;

        velocity.x *= VELOCITY;
        velocity.y *= VELOCITY;

        velocity.x = velocity.x > MAX_VELOCITY
          ? MAX_VELOCITY
          : velocity.x < -MAX_VELOCITY
          ? -MAX_VELOCITY
          : velocity.x;
        velocity.y = velocity.y > MAX_VELOCITY
          ? MAX_VELOCITY
          : velocity.y < -MAX_VELOCITY
          ? -MAX_VELOCITY
          : velocity.y;
      }
      this.previousOffset = offset;
    }

    //if (this.props.getInitialClientOffset)
    //  console.log(this.props.getInitialClientOffset.x
    //    , this.props.getInitialSourceClientOffset.x
    //    , this.props.getClientOffset.x
    //    , this.props.getDifferenceFromInitialOffset.x
    //    , this.props.getSourceClientOffset.x
    //  );

    const dragProps = {
      offset
      , initialOffset
      , velocity
      , animationCounter: this.animationCounter
      , afterStart: this.animationCounter > 2
    };

    return (
      <div style={layerStyles}>
        {this.animationCounter}
        {isDragging && offset ? this.renderItem(itemType, item, dragProps) : null}
        {/*<Marker offset={this.props.getInitialClientOffset} color="red"/>
        <Marker offset={this.props.getInitialSourceClientOffset} color="teal"/>
        <Marker offset={this.props.getClientOffset} color="green"/>
        <Marker offset={this.props.getDifferenceFromInitialOffset} color="blue"/>
        <Marker offset={this.props.getSourceClientOffset} color="orange"/>*/}
      </div>
    );
  }
}

const Marker = ({offset, color}) => offset === null ? null : <div style={{
        background: color
        , width: '5px', height: '5px'
        , position: 'absolute'
        , left: offset.x + 'px'
        , top: offset.y + 'px'
        }}></div>


export default DragLayer((monitor) => ({
  item: monitor.getItem()
  , itemType: monitor.getItemType()
  , isDragging: monitor.isDragging()
  //, getInitialClientOffset: monitor.getInitialClientOffset()
  , getInitialSourceClientOffset: monitor.getInitialSourceClientOffset()
  , getClientOffset: monitor.getClientOffset()
  //, getDifferenceFromInitialOffset: monitor.getDifferenceFromInitialOffset()
  //, getSourceClientOffset: monitor.getSourceClientOffset()
}))(CustomDragLayer);