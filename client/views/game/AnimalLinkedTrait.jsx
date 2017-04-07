import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {Portal} from '../utils/Portal.jsx';

const AnimalLinkedTraits = [];

export class AnimalLinkedTrait extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.tick = this.tick.bind(this);
  }

  static propTypes = {
    trait: PropTypes.node.isRequired
    , sourceAnimalId: PropTypes.string.isRequired
  };

  componentDidMount() {
    this._isMounted = true;
    this.node = ReactDOM.findDOMNode(this);
    AnimalLinkedTraits.push(this);
    requestAnimationFrame(this.tick)
  }

  componentWillUnmount() {
    this._isMounted = false;
    AnimalLinkedTraits.remove(this);
    this.targetTrait = null;
    cancelAnimationFrame(this.tick)
  }

  tick() {
    if (this._isMounted) {
      const {index, trait, sourceAnimalId} = this.props;
      if (this.targetTrait && this.targetTrait._isMounted) {
        //const bending = 50 + 25 * index;
        const bbx1 = ReactDOM.findDOMNode(this).getBoundingClientRect();
        const bbx2 = ReactDOM.findDOMNode(this.targetTrait).getBoundingClientRect();
        const x1 = bbx1.left + bbx1.width / 2;
        const y1 = bbx1.top;
        const x2 = bbx2.left + bbx2.width / 2;
        const y2 = bbx2.top;
        const maxSize = 400;

        const xlen = (x2 - x1);
        const ylen = (y2 - y1);
        const bending = Math.abs(.25 * (x2 - x1));

        const strokeWidth = 5 + 10 * Math.abs(xlen / maxSize);

        const cx1 = xlen / 5;
        const cy1 = -bending;
        const cx2 = xlen / 5 * 4;
        const cy2 = -bending;

        this.setState({
          d: `M${x1},${y1} c${cx1},${cy1} ${cx2},${cy2} ${xlen},${ylen}`
          , strokeWidth
          , cx1: x1 + cx1, cy1: y1 + cy1
          , cx2: x1 + cx2, cy2: y1 + cy2
        });


        //const bending = Math.abs(.25 * (x2 - x1));
        //
        //const cx = xlen / 2;
        //const cy = -bending;
        //
        //this.setState({d: `M${x1},${y1} q${cx},${cy} ${xlen},${ylen}`, cx: x1 + cx, cy: y1 + cy});
      } else {
        this.state = null;
        this.forceUpdate();
        this.targetTrait = AnimalLinkedTraits.find((alt) => {
          return alt !== this
            && !alt.targetTrait
            && sourceAnimalId === alt.props.trait.linkAnimalId
            && trait.linkAnimalId === alt.props.sourceAnimalId
        })
      }
      requestAnimationFrame(this.tick);
    }
  }

  renderInPortal() {
    if (this.state === null) return <g/>;
    var color = "#" + (Math.random() * 0xFFFFFF << 0).toString(16);
    var color = '#00F';
    return <g>
      <path d={this.state.d} style={{
       strokeWidth: this.state.strokeWidth + 'px'
       , strokeLinecap: 'round'
       , opacity: .5
       , stroke: color
       , fill: 'none'
      }}/>
    </g>
  }

  render() {
    return (<div>
      <Portal target='game-svg'>
        {this.renderInPortal()}
      </Portal>
    </div>);
  }
}
//<circle cx={this.state.cx1} cy={this.state.cy1} r='5' fill={color}/>
//<circle cx={this.state.cx2} cy={this.state.cy2} r='5' fill={color}/>
//<line  strokeWidth="5px" stroke="black" {...this.state}/>