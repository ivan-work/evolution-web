//import React, {Component} from 'react';
import React from 'react';
import cn from 'classnames';
import AnimalTraitArrowMarker from './AnimalTraitArrowMarker.jsx';

import styles from '../../../styles.json'
const {ANIMAL_WIDTH, ANIMAL_TRAIT_HEIGHT} = styles;

const svgStyle = {position: 'absolute', left: '0', top: '0'};

const style = {
  stroke: 'red'
  , fill: 'blue'
  , markerEnd: 'url(#arrow)'
};

export class AnimalTraitArrow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {offset, initialOffset, velocity, afterStart, trait, animationCounter} = this.props;
    if (!offset) return null;
    const {x, y} = offset;

    const x1 = initialOffset.x + ANIMAL_WIDTH / 2;
    const y1 = initialOffset.y + ANIMAL_TRAIT_HEIGHT / 2;
    const length = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
    const strokeWidth = Math.log(length);
    const angle = Math.atan2(y - y1, x - x1);
    const x2 = x1 + Math.cos(angle) * (length - strokeWidth);
    const y2 = y1 + Math.sin(angle) * (length - strokeWidth);

    style.strokeWidth = strokeWidth + 'px';

    return <svg width="100%" height="100%" style={svgStyle}>
      <defs>
        <AnimalTraitArrowMarker id='arrow' markerSize={2} markerEnd={true} className='AnimalTraitArrow'/>
      </defs>
      <g>
        <path d={`M${x1},${y1} L${x2},${y2}`} style={{...style}}/>
      </g>
    </svg>
  }
}