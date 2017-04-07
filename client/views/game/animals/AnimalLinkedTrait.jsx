import _ from 'lodash';
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

//import {Tooltip} from './../../utils/Tooltips.jsx';
import {Tooltip} from './../../utils/Tooltips.jsx';
import {Portal} from '../../utils/Portal.jsx';
import {AnimalTrait} from './AnimalTrait.jsx';
import AnimalTraitArrowMarker from './AnimalTraitArrowMarker.jsx';

const AnimalLinkedTraits = [];

const traitPropsMap = _.forIn({
  TraitCommunication: {
    color: '#00F'
  }
  , TraitCooperation: {
    color: '#F00'
  }
  , TraitSymbiosis: {
    color: '#F0F'
    , marker: 'url(#symbioticArrow)'
  }
  , default: {
    color: '#999'
    , opacity: 1
  }
}, (obj) => _.defaults(obj, {
  color: '#000'
  , opacity: .75
  , marker: 'none'
}));

export class AnimalLinkedTrait extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.tick = this.tick.bind(this);
  }

  static propTypes = {
    trait: PropTypes.object.isRequired
    , sourceAnimal: PropTypes.object.isRequired
  };

  componentDidMount() {
    this._isMounted = true;
    this.node = ReactDOM.findDOMNode(this);
    this.animalHtml = document.getElementById('AnimalBody' + this.props.sourceAnimal.id);
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
      const {trait} = this.props;
      if (this.targetTrait && this.targetTrait._isMounted) {
        // http://stackoverflow.com/questions/25630035/javascript-getboundingclientrect-changes-while-scrolling
        const bbx1 = this.node.getBoundingClientRect();
        const bbx2 = this.targetTrait.node.getBoundingClientRect();

        const bbx1a = this.animalHtml.getBoundingClientRect();
        const bbx2a = this.targetTrait.animalHtml.getBoundingClientRect();

        let x1 = bbx1.left + bbx1.width / 2 + (window.scrollX || 0);
        let y1 = bbx1.top + bbx1.height / 2 + (window.scrollY || 0);
        let x2 = bbx2.left + bbx2.width / 2 + (window.scrollX || 0);
        let y2 = bbx2.top + bbx2.height / 2 + (window.scrollY || 0);

        const angleAnimal1 = Math.atan2(bbx1a.bottom - bbx2a.bottom, bbx1a.right - bbx2a.right);
        const angleAnimal2 = Math.atan2(bbx2a.bottom - bbx1a.bottom, bbx2a.right - bbx1a.right);
        const angleAnimal = -(Math.abs(angleAnimal1) < Math.abs(angleAnimal2)
          ? angleAnimal1 : angleAnimal2);

        const angle = Math.atan2(y1 - y2, x1 - x2);
        x1 -= 8 * Math.sin(angleAnimal);
        y1 -= 8 * Math.cos(angleAnimal);
        x2 -= 8 * Math.sin(angleAnimal);
        y2 -= 8 * Math.cos(angleAnimal);

        //const reversed = true//x1 < x2 || (x1 === x2 && y1 < y2 );
        const reversed = angleAnimal < 0 ? angleAnimal1 < angleAnimal2 : angleAnimal1 > angleAnimal2;

        [x1, y1, x2, y2] = (reversed
          ? [x1, y1, x2, y2]
          : [x2, y2, x1, y1]);

        //${.5 + .5 * length}
        const length = 1 - .005 * Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

        const strokeWidth = 4;

        this.setState({
          d: `M${x1},${y1} A 1 ${.5 + .5 * length} ${angle * 180 / Math.PI || 0} 1 1 ${x2},${y2}`
          , reversed
          , debug: [(angleAnimal*180/Math.PI).toFixed(1) >= 0
            , angleAnimal1 > angleAnimal2
            , x1 < x2
          ].join(',')
          , strokeWidth
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
      <Tooltip label={T.translate('Game.Trait.' + this.props.trait.type)}>
        <path d={this.state.d} style={{
         strokeWidth: this.state.strokeWidth + 'px'
         , strokeLinecap: 'round'
         , opacity: traitProps.opacity
         , stroke: traitProps.color
         , fill: 'none'
         , pointerEvents: 'auto'
         , markerStart: !this.state.reversed ? traitProps.marker : 'none'
         , markerEnd: this.state.reversed ? traitProps.marker : 'none'
        }}/>
      </Tooltip>
    </g>
  }

  render() {
    const {trait} = this.props;
    return (<div>
      <AnimalTrait trait={trait}/>
      {/*this.state && this.state.angle*/}
      <Portal target='game-svg'>
        {this.renderInPortal()}
      </Portal>
    </div>);
  }
}
//<circle cx={this.state.cx1} cy={this.state.cy1} r='5' fill={color}/>
//<circle cx={this.state.cx2} cy={this.state.cy2} r='5' fill={color}/>
//<line  strokeWidth="5px" stroke="black" {...this.state}/>


//if (this._isMounted) {
//  const {index, trait} = this.props;
//  if (this.targetTrait && this.targetTrait._isMounted) {
//    const bbx1 = this.node;
//    const bbx2 = this.targetTrait.node;
//    const x1 = 0
//      + bbx1.offsetLeft
//      + bbx1.offsetParent.offsetLeft
//      + bbx1.offsetParent.offsetParent.offsetLeft
//      + bbx1.offsetWidth / 2;
//    const y1 = 0
//      + bbx1.offsetTop
//      + bbx1.offsetParent.offsetTop
//      + bbx1.offsetParent.offsetParent.offsetTop
//      + bbx1.offsetHeight / 2;
//    const x2 = 0
//      + bbx2.offsetLeft
//      + bbx2.offsetParent.offsetLeft
//      + bbx2.offsetParent.offsetParent.offsetLeft
//      + bbx2.offsetWidth / 2;
//    const y2 = 0
//      + bbx2.offsetTop
//      + bbx2.offsetParent.offsetTop
//      + bbx2.offsetParent.offsetParent.offsetTop
//      + bbx2.offsetHeight / 2;
//
//    const maxSize = 1600;
//
//    const xlen = (x2 - x1);
//    const ylen = (y2 - y1);
//    //const angle = Math.atan2(xlen, ylen);
//    const dist = xlen * xlen + ylen * ylen;
//    const bending = .25 * 2;
//
//    const strokeWidth = 3 + .25 * Math.abs(dist / maxSize);
//
//    this.setState({
//      d: `M${x1},${y1} A 3 2 0 1 1 ${x2},${y2}`
//      , strokeWidth
//    });
//  } else {
//    this.state = null;
//    this.targetTrait = AnimalLinkedTraits.find((alt) => trait.id === alt.props.trait.linkId);
//    this.forceUpdate();
//  }
//  window.requestAnimationFrame(this.tick);
//}