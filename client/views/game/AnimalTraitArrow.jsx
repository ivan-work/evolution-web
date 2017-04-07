//import React, {Component} from 'react';
import React from 'react';
import ReactDOM from 'react-dom';
import cn from 'classnames';

import {ANIMAL_TRAIT_SIZE} from './AnimalTrait.jsx'

const ARROW_MARKER = 2;

export class AnimalTraitArrow extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var markerNode = ReactDOM.findDOMNode(this.marker);

    markerNode.setAttribute('markerWidth', ARROW_MARKER);
    markerNode.setAttribute('markerHeight', ARROW_MARKER);
    markerNode.setAttribute('refX', 0);
    markerNode.setAttribute('refY', ARROW_MARKER / 2);
    markerNode.setAttribute('orient', 'auto');
  }

  render() {
    const {offset, initialOffset, velocity, afterStart, trait, animationCounter} = this.props;
    if (!offset) return null;
    const { x, y } = offset;

    const x1 = initialOffset.x + ANIMAL_TRAIT_SIZE.width / 2;
    const y1 = initialOffset.y + ANIMAL_TRAIT_SIZE.height / 2;
    const length = Math.sqrt((x - x1)*(x - x1) + (y - y1)*(y - y1));
    const lineWidth = length / 20;
    const angle = Math.atan2(y - y1, x - x1);
    const x2 = x1 + Math.cos(angle) * (length - lineWidth);
    const y2 = y1 + Math.sin(angle) * (length - lineWidth);

    return <svg width="100%" height="100%" style={{position: 'absolute', left: '0', top: '0'}}>
      <defs>
        <marker id="arrow" ref={(e) => this.marker = e}>
          <path d={`M0,0 L0,${ARROW_MARKER} L${ARROW_MARKER/4*3},${ARROW_MARKER/2} z`} style={{
          fill: 'red'
          }}/>
        </marker>
      </defs>
      <path d={`M${x1},${y1} L${x2},${y2}`}
            style={{
              stroke: 'red'
              , strokeWidth: lineWidth + 'px'
              , fill: 'none'
              , markerEnd: 'url(#arrow)'
            }}
      />

    </svg>
  }
}