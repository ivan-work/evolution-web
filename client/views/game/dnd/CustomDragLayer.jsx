import React from 'react';
import {DragLayer} from 'react-dnd';
import {DND_ITEM_TYPE} from './DND_ITEM_TYPE';
import DragCardPreview from '../cards/DragCardPreview.jsx';
import {AnimalTraitArrow} from '../animals/AnimalTraitArrow.jsx';
import {Food} from '../food/Food.jsx';
import {ArrowPreview} from './ArrowPreview.jsx';

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
        return <DragCardPreview card={item.card} alternateTrait={item.alternateTrait} {...dragProps}/>;
      case DND_ITEM_TYPE.TRAIT:
        return <AnimalTraitArrow trait={item.trait} {...dragProps}/>;
      case DND_ITEM_TYPE.FOOD:
        return <DefaultPreview {...dragProps}><Food/></DefaultPreview>;
      case DND_ITEM_TYPE.ANIMAL_LINK:
        return <ArrowPreview initialOffsetShift={{x: 0, y: 0}} fill='red' {...dragProps}/>;
    }
  }

  render() {
    const {item, itemType, isDragging} = this.props;
    const offset = this.props.getClientOffset;
    const initialOffset = this.props.getInitialSourceClientOffset;

    this.animationCounter = item ? ++this.animationCounter : 0;

    const MAX_VELOCITY = 60;
    const VELOCITY = 15;
    const velocity = {x: 0, y: 0};
    if (offset) {
      if (this.previousOffset) {
        velocity.x = offset.x - this.previousOffset.x;
        velocity.y = offset.y - this.previousOffset.y;

        velocity.x *= VELOCITY;
        velocity.y *= VELOCITY;

        velocity.x = velocity.x > MAX_VELOCITY ? MAX_VELOCITY
          : velocity.x < -MAX_VELOCITY ? -MAX_VELOCITY
          : velocity.x;
        velocity.y = velocity.y > MAX_VELOCITY ? MAX_VELOCITY
          : velocity.y < -MAX_VELOCITY ? -MAX_VELOCITY
          : velocity.y;
      }
      this.previousOffset = offset;
    }

    const dragProps = {
      offset
      , initialOffset
      , velocity
      , animationCounter: this.animationCounter
      , afterStart: this.animationCounter > 2
    };

    return (
      <div style={layerStyles}>
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

const DefaultPreview = (props) => {
  const {offset} = props;
  if (!offset) return null;
  const {x, y} = offset;
  return <div className='Preview draggable isDragging' style={{
    left: x + 'px'
    , top: y + 'px'
    , position: 'absolute'
    , transform: 'translate(-50%, -50%)'
    , pointerEvents: 'none'
  }}>
    {props.children}
  </div>
};


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