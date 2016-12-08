import React from 'react';
import {Card} from './Card.jsx';

export default ({offset, initialOffset, velocity, afterStart, card, animationCounter, alternateTrait}) => {
  if (!offset) return null;
  const {x, y} = offset;
  const translate = afterStart
    //? `translate(${-CARD_WIDTH / 2}px, ${-CARD_HEIGHT / 2}px)`
    ? `translate(-50%,-50%)`
    : `translate(${initialOffset.x - offset.x}px,${initialOffset.y - offset.y}px)`;
  return <div className='CardPreview' style={{
    //, transform: `translate(${x}px, ${y}px) perspective(400px) rotateY(${velocity.x * VELOCITY}deg) rotateX(${-velocity.y * VELOCITY}deg)`
    position: 'absolute'
    , left: x + 'px'
    , top: y + 'px'
    , transform: `${translate} perspective(400px) rotateY(${velocity.x}deg) rotateX(${-velocity.y}deg)`
    , transition: 'box-shadow .5s, transform .2s'
    , boxShadow: afterStart ? '5px 5px 5px black' : ''
    , pointerEvents: 'none'
    }}>
    <Card card={card} alternateTrait={alternateTrait}/>
  </div>
};