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
    , dragEnabled: React.PropTypes.bool
  };

  static defaultProps = {
    dragEnabled: false
    , isDragging: false
  };

  constructor(props) {
    super(props);
    this.state = {alternateTrait: false};
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.switchTrait = this.switchTrait.bind(this);
  }

  switchTrait(e) {
    if (this.cooldown) {
      console.warn('switchTrait cooldown active', this.props.card.id);
      return;
    }
    this.setState({alternateTrait: !this.state.alternateTrait});
  }

  static renderCard(card, props) {
    props.mixClassName = props.mixClassName || {};
    const className = classnames({
      Card: true
      , ['trait-count-' + card.traitsCount]: true
      , ...props.mixClassName
    });
    delete props.mixClassName;
    const style = {
      ...CARD_SIZE
    };
    const innerStyle = {
      backgroundSize: `${CARD_SIZE.width}px ${CARD_SIZE.height}px`
    };
    if (card.image) {
      innerStyle.backgroundImage = `url(${card.image})`;
    }
    return <div className={className} style={style} {...props}>
      <div className='inner' style={innerStyle}>
        {card.traitsCount === 1
          ? (<div className='trait trait-single'>{card.name}</div>)
          : null}

        {card.traitsCount === 2
          ? (<div className='trait trait1'>{card.name}</div>)
          : null}

        {card.traitsCount === 2
          ? (<div className='trait trait2'>{card.name2}</div>)
          : null}
      </div>
    </div>
  }

  render() {
    const {card, canDrag, connectDragSource, isDragging} = this.props;

    const onClick = (card.traitsCount === 2
    && canDrag
      ? this.switchTrait
      : null);

    const body = Card.renderCard(card, {
      mixClassName: {
        canDrag
        , isDragging
        , draggable: connectDragSource
        , alternateTrait: this.state.alternateTrait
      }
      , onClick
    });
    return connectDragSource ? connectDragSource(body) : body;
  }
}

export const DragCardPreview = ({offset, initialOffset, velocity, afterStart, card, animationCounter, alternateTrait}) => {
  if (!offset) return null;
  const {x, y} = offset;
  const translate = afterStart
    ? `translate(${-CARD_SIZE.width / 2}px, ${-CARD_SIZE.height / 2}px)`
    : `translate(${initialOffset.x - offset.x}px,${initialOffset.y - offset.y}px)`;
  return <div className='CardPreview' style={{
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
    {Card.renderCard(card, {mixClassName: {alternateTrait}})}
  </div>
};

export const DragCard = DragSource(DND_ITEM_TYPE.CARD
  , {
    beginDrag: (props, monitor, component) => ({card: props.card, alternateTrait: component.state.alternateTrait})
    , canDrag: (props, monitor) => props.dragEnabled
    , endDrag: (props, monitor, component) => {
      if (component !== null) {
        component.cooldown = true;
        setTimeout(() => {
          component.cooldown = false;
        }, 200);
      }
    }
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
    , canDrag: monitor.canDrag()
  })
)(Card);