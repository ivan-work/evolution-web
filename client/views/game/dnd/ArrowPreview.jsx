import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {Portal} from '../../utils/Portal.jsx'

export class ArrowPreview extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.setupMarker = (marker) => {
      if (!marker) return;
      var markerNode = ReactDOM.findDOMNode(marker);
      markerNode.setAttribute('markerWidth', this.props.markerSize);
      markerNode.setAttribute('markerHeight', this.props.markerSize);
      markerNode.setAttribute('refX', 0);
      markerNode.setAttribute('refY', this.props.markerSize / 2);
      markerNode.setAttribute('orient', 'auto');
    }
  }

  static propTypes = {
    markerSize: PropTypes.number.isRequired
    , initialOffsetShift: PropTypes.shape({x: PropTypes.number, y: PropTypes.number})
    , fill: PropTypes.string.isRequired
    // DragProps
    , offset: PropTypes.shape({x: PropTypes.number, y: PropTypes.number})
    , initialOffset: PropTypes.shape({x: PropTypes.number, y: PropTypes.number})
    , velocity: PropTypes.shape({x: PropTypes.number, y: PropTypes.number})
    , animationCounter: PropTypes.number
    , afterStart: PropTypes.bool
  };

  static defaultProps = {
    markerSize: 2
    , initialOffsetShift: {x: 0, y: 0}
  };

  componentDidMount() {
  }

  render() {
    const {offset, initialOffset, velocity, afterStart, animationCounter
      , initialOffsetShift} = this.props;

    if (!offset) return null;

    const { x, y } = offset;

    const x1 = initialOffset.x + initialOffsetShift.x;
    const y1 = initialOffset.y + initialOffsetShift.y;
    const length = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
    const lineWidth = length / 20;
    const angle = Math.atan2(y - y1, x - x1);
    const x2 = x1 + Math.cos(angle) * (length - lineWidth);
    const y2 = y1 + Math.sin(angle) * (length - lineWidth);

    return (<Portal target='game-svg'>
      <defs>
        <marker id="arrow" ref={this.setupMarker}>
          <path d={`M0,0 L0,${this.props.markerSize} L${this.props.markerSize/4*3},${this.props.markerSize/2} z`} style={{
          fill: this.props.fill
          }}/>
        </marker>
      </defs>
      <path d={`M${x1},${y1} L${x2},${y2}`}
            style={{
              stroke: this.props.fill
              , strokeWidth: lineWidth + 'px'
              , fill: 'none'
              , markerEnd: 'url(#arrow)'
            }}
      />
    </Portal>)
  }
}