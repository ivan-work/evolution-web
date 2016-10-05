//import React, {Component} from 'react';
import React from 'react';
import ReactDOM from 'react-dom';
import cn from 'classnames';

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
    const {currentOffset} = this.props;

    if (!currentOffset) {
      return null;
    }

    const { x, y } = currentOffset;

    if (!this.source) {
      this.source = currentOffset;
    }

    const transform = `translate(${x}px, ${y}px)`;

    //console.log(`M${this.source.x},${this.source.y} L${x},${y}`)
    return <svg width="100%" height="100%" style={{cursor: 'move'}}>
      <defs>
        <marker id="arrow" ref={(e) => this.marker = e}>
          <path d={`M0,0 L0,${ARROW_MARKER} L${ARROW_MARKER/4*3},${ARROW_MARKER/2} z`} style={{
          fill: 'red'
          }}/>
        </marker>
      </defs>
      <path d={`M${this.source.x},${this.source.y} L${x},${y}`}
            style={{
              stroke: 'red'
              , opacity: .5
              , strokeWidth: '20px'
              , fill: 'none'
              , markerEnd: 'url(#arrow)'
            }}
      />

    </svg>
  }
}