import _ from 'lodash';
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {Tooltip} from './../../utils/Tooltips.jsx';
import {Portal} from '../../utils/Portal.jsx';
import {AnimalTrait} from './AnimalTrait.jsx';
import {AnimalTraitArrowMarker} from './AnimalTraitArrowMarker.jsx';

const AnimalLinkedTraits = [];

const traitPropsMap = _.forIn({
  TraitCommunication: {
    color: '#00F'
  }
  , TraitCooperation: {
    color: '#F00'
  }
  , TraitSymbiosis: {
    color: '#090'
    , markerEnd: 'url(#symbioticArrow)'
  }
  , default: {
    color: '#999'
    , opacity: 1
  }
}, (obj) => _.defaults(obj, {
  color: '#000'
  , opacity: .75
  , markerEnd: 'none'
}));

export class AnimalLinkedTrait extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.tick = this.tick.bind(this);
  }

  static propTypes = {
    trait: PropTypes.object.isRequired
  };

  componentDidMount() {
    this._isMounted = true;
    this.node = ReactDOM.findDOMNode(this);
    AnimalLinkedTraits.push(this);
    if (this.props.trait.linkSource) {
      window.requestAnimationFrame(this.tick)
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    AnimalLinkedTraits.remove(this);
    this.targetTrait = null;
    window.cancelAnimationFrame(this.tick)
  }

  tick() {
    if (this._isMounted) {
      const {index, trait} = this.props;
      if (this.targetTrait && this.targetTrait._isMounted) {
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

        const strokeWidth = 5 + 1 * Math.abs(xlen / maxSize);

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
      } else {
        this.state = null;
        this.targetTrait = AnimalLinkedTraits.find((alt) => trait.id === alt.props.trait.linkId);
        this.forceUpdate();
      }
      window.requestAnimationFrame(this.tick);
    }
  }

  renderInPortal() {
    if (this.state === null) return <g/>;
    const traitProps = traitPropsMap[this.props.trait.type] || traitPropsMap.default;
    //var color = "#" + (Math.random() * 0xFFFFFF << 0).toString(16);
    return <g>
      <defs>
        <AnimalTraitArrowMarker id='symbioticArrow' markerSize={4} style={{
          fill: traitPropsMap.TraitSymbiosis.color
        }}/>
      </defs>
      <Tooltip tip={T.translate('Game.Trait.' + this.props.trait.type)}>
        <path d={this.state.d} style={{
         strokeWidth: this.state.strokeWidth + 'px'
         , strokeLinecap: 'round'
         , opacity: traitProps.opacity
         , stroke: traitProps.color
         , fill: 'none'
         , pointerEvents: 'auto'
         , markerEnd: traitProps.markerEnd
        }}/>
      </Tooltip>
    </g>
  }

  render() {
    return (<div>
      <AnimalTrait trait={this.props.trait}/>
      <Portal target='game-svg'>
        {this.renderInPortal()}
      </Portal>
    </div>);
  }
}
//<circle cx={this.state.cx1} cy={this.state.cy1} r='5' fill={color}/>
//<circle cx={this.state.cx2} cy={this.state.cy2} r='5' fill={color}/>
//<line  strokeWidth="5px" stroke="black" {...this.state}/>