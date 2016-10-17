import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DND_ITEM_TYPE } from './dnd/DND_ITEM_TYPE';

import { CardModel } from '../../../shared/models/game/CardModel';

export const CARD_SIZE = {
  width: 60
  , height: 80
};

export class Card extends React.Component {
  static propTypes = {
    card: React.PropTypes.instanceOf(CardModel).isRequired
    , disabled: React.PropTypes.bool
  };

  static defaultProps = {
    disabled: false
    , isDragging: false
  };

  constructor(props) {
    super(props);
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    //if (this.props.connectDragPreview && !process.env.TEST)
    //  this.props.connectDragPreview(getEmptyImage());
  }

  render() {
    const {card, canDrag, connectDragSource, isDragging} = this.props;

    const className = classnames({
      Card: true
      , canDrag: canDrag
      , isDragging: isDragging
      , draggable: connectDragSource
    });

    const style = {
      ...CARD_SIZE
      , backgroundSize: `${CARD_SIZE.width}px ${CARD_SIZE.height}px`
    };
    if (card.image)
      style.backgroundImage = `url(${card.image})`;

    const body = <div className={className} style={style}>
      <div className='inner'>
        {card.name} {isDragging}
      </div>
    </div>;
    return connectDragSource ? connectDragSource(body) : body;
  }
}

export const DragCardPreview = ({offset, initialOffset, velocity, afterStart, card, animationCounter}) => {
  if (!offset) return null;
  const {x, y} = offset;
  //console.log(offset, initialOffset)
  //const translate = `translate(${initialOffset.x - offset.x}px,${initialOffset.y - offset.y}px)`;
  const translate = afterStart
    ? `translate(${-CARD_SIZE.width / 2}px, ${-CARD_SIZE.height / 2}px)`
    : `translate(${initialOffset.x - offset.x}px,${initialOffset.y - offset.y}px)`;
  return <div className='Card Preview' style={{
    ...CARD_SIZE
    //, transform: `translate(${x}px, ${y}px) perspective(400px) rotateY(${velocity.x * VELOCITY}deg) rotateX(${-velocity.y * VELOCITY}deg)`
    , left: x + 'px'
    , top: y + 'px'
    , position: 'absolute'
    , transform: `${translate} perspective(400px) rotateY(${velocity.x}deg) rotateX(${-velocity.y}deg)`
    , transition: 'box-shadow .5s, transform .2s'
    , boxShadow: afterStart ? '5px 5px 5px black' : ''
    , pointerEvents: 'none'
    }}>
    <div className='inner'>
      {card.name} {velocity.x} {velocity.y}
    </div>
  </div>
};

export const DragCard = DragSource(DND_ITEM_TYPE.CARD
  , {
    beginDrag: (props) => ({card: props.card})
    , canDrag: (props, monitor) => true
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , connectDragPreview: connect.dragPreview()
    , isDragging: monitor.isDragging()
    , canDrag: monitor.canDrag()
  })
)(Card);