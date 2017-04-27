import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom';
import T from 'i18n-react';
import cn from 'classnames';

import Tooltip from 'rc-tooltip';
import {Portal} from '../../utils/Portal.jsx';
import {AnimalTrait} from './AnimalTrait.jsx';
import AnimalTraitArrowMarker from './AnimalTraitArrowMarker.jsx';

import {ANIMAL_TRAIT_HEIGHT} from '../../../styles.json';

const AnimalLinkedTraits = [];

export class AnimalLinkedTrait extends React.PureComponent {
  static contextTypes = {svgContext: PropTypes.object.isRequired};

  constructor(props) {
    super(props);
    // this.tick = this.tick.bind(this);
  }

  static propTypes = {
    trait: PropTypes.object.isRequired
    , sourceAnimal: PropTypes.object.isRequired
  };

  componentDidMount() {
    this.$isMounted = true;
    this.context.svgContext.then((context) => {
      if (this.$isMounted) context.mountLinkedTrait(this);
    });
    // this.node = ReactDOM.findDOMNode(this);
    // AnimalLinkedTraits.push(this);
    // if (this.props.trait.linkSource) {
    //   window.requestAnimationFrame(this.tick)
    // }
  }

  componentWillUnmount() {
    this.$isMounted = false;
    this.context.svgContext.then((context) => {
      context.unmountLinkedTrait(this);
    });
    // AnimalLinkedTraits.remove(this);
    // this.targetTrait = null;
    // window.cancelAnimationFrame(this.tick)
  }

  tick() {
    if (this._isMounted) {
      const {trait, sourceAnimal} = this.props;
      if (this.targetTrait && this.targetTrait._isMounted) {
        // http://stackoverflow.com/questions/25630035/javascript-getboundingclientrect-changes-while-scrolling
        // const bbx1 = this.node.getBoundingClientRect();
        // const bbx2 = this.targetTrait.node.getBoundingClientRect();

        // let x1 = bbx1.left + bbx1.width / 2 + (window.scrollX || 0);
        // let y1 = bbx1.top + bbx1.height / 2 + (window.scrollY || 0);
        // let x2 = bbx2.left + bbx2.width / 2 + (window.scrollX || 0);
        // let y2 = bbx2.top + bbx2.height / 2 + (window.scrollY || 0);
        const bbx1 = this.node;
        const bbx2 = this.targetTrait.node;
        const wrapper = document.getElementById('PlayerSticker'+sourceAnimal.ownerId);
        // console.log(bbx1)
        let x1 = -wrapper.scrollLeft
          + bbx1.offsetLeft
          + bbx1.offsetParent.offsetLeft
          + bbx1.offsetParent.offsetParent.offsetLeft
          + bbx1.offsetWidth / 2;
        let y1 = 0
          + bbx1.offsetTop
          + bbx1.offsetParent.offsetTop
          + bbx1.offsetParent.offsetParent.offsetTop
          + bbx1.offsetHeight / 2;
        let x2 = -wrapper.scrollLeft
          + bbx2.offsetLeft
          + bbx2.offsetParent.offsetLeft
          + bbx2.offsetParent.offsetParent.offsetLeft
          + bbx2.offsetWidth / 2;
        let y2 = 0
          + bbx2.offsetTop
          + bbx2.offsetParent.offsetTop
          + bbx2.offsetParent.offsetParent.offsetTop
          + bbx2.offsetHeight / 2;

        const angleAnimal = 0;

        const angle = Math.atan2(y1 - y2, x1 - x2);
        y1 -= ANIMAL_TRAIT_HEIGHT / 2;
        y2 -= ANIMAL_TRAIT_HEIGHT / 2;

        const reversed = x1 < x2;

        [x1, y1, x2, y2] = (reversed
          ? [x1, y1, x2, y2]
          : [x2, y2, x1, y1]);

        //${.5 + .5 * length}
        const length = 1 - .005 * Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

        const strokeWidth = 4;

        this.setState({
          d: `M${x1},${y1} A 1 ${.5 + .5 * length} ${angle * 180 / Math.PI || 0} 1 1 ${x2},${y2}`
          , reversed
          , debug: [(angleAnimal * 180 / Math.PI).toFixed(1) >= 0
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
      // setTimeout(() => window.requestAnimationFrame(this.tick), 1e3);
    }
  }

  renderInPortal() {
    if (this.state === null) return null;
    //var color = "#" + (Math.random() * 0xFFFFFF << 0).toString(16);
    const markerClassName = cn({
      [this.props.trait.type]: true
      , Marker: true
    });
    const linkClassName = cn({
      [this.props.trait.type]: true
      , Link: true
      , MarkerStart: !this.state.reversed
      , MarkerEnd: this.state.reversed
    });
    return <g>
      <defs>
        <AnimalTraitArrowMarker id='symbioticArrow' className={markerClassName} markerSize={4}/>
      </defs>
      <Tooltip
        placement='top'
        mouseEnterDelay={.1}
        destroyTooltipOnHide
        overlay={<span>{T.translate('Game.Trait.' + this.props.trait.type)}</span>}>
        <path className={linkClassName} d={this.state.d} style={{
          strokeWidth: this.state.strokeWidth + 'px'
          , strokeLinecap: 'round'
          , fill: 'none'
          , pointerEvents: 'auto'
        }}/>
      </Tooltip>
    </g>
  }

  render() {
    const {trait, sourceAnimal} = this.props;
    return (<div>
      <AnimalTrait trait={trait}/>
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