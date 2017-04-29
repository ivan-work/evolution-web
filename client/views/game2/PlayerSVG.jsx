import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import RIP from 'react-immutable-proptypes';
import T from 'i18n-react';
import cn from 'classnames';

import AnimalTraitArrowMarker from './animals/AnimalTraitArrowMarker.jsx';

const linkedTraitPathStyle = {
  strokeWidth: '4px'
  , strokeLinecap: 'round'
  , fill: 'none'
  , pointerEvents: 'auto'
};

export default class PlayerSVG extends React.Component {
  constructor(...args) {
    super(...args);
    this.tick = this.tick.bind(this);
    this.linkedTraits = {};
    this.state = {links: []};
  }

  componentDidMount() {
    this.$isMounted = true;
    window.requestAnimationFrame(this.tick)
  }

  componentWillUnmount() {
    this.$isMounted = false;
    window.cancelAnimationFrame(this.tick)
  }

  isTraitInLink(link, traitId) {
    return link[0] === traitId || link[1] === traitId;
  }

  mountLinkedTrait(linkedTrait) {
    const trait = linkedTrait.props.trait;
    this.linkedTraits[trait.id] = linkedTrait;
    const links = this.state.links;
    if (this.$isMounted && this.linkedTraits[trait.linkId] && !links.some(link => this.isTraitInLink(link, trait.id))) {
      links.push([trait.id, trait.linkId]);
      this.setState(links)
    }
  }

  unmountLinkedTrait(linkedTrait) {
    const trait = linkedTrait.props.trait;
    if (this.$isMounted && this.linkedTraits[trait.id]) {
      delete this.linkedTraits[trait.id];
      this.setState({links: this.state.links.filter(link => this.isTraitInLink(link, trait.id))});
    }
  }

  tick() {
    if (this.$isMounted) {
      this.updateLinkedTraits();
      window.requestAnimationFrame(this.tick)
      // setTimeout(() => window.requestAnimationFrame(this.tick), 1e3)
    }
  }

  updateLinkedTraits() {
    this.state.links.forEach((link) => {
      const linkedTrait1 = this.linkedTraits[link[0]];
      const linkedTrait2 = this.linkedTraits[link[1]];
      if (linkedTrait1 && linkedTrait1.$isMounted && linkedTrait2 && linkedTrait2.$isMounted) {
        const trait1 = linkedTrait1.props.trait;
        const trait2 = linkedTrait2.props.trait;
        const linkedTrait1html = ReactDOM.findDOMNode(linkedTrait1);
        const linkedTrait2html = ReactDOM.findDOMNode(linkedTrait2);
        const svgElement = document.getElementById(`Link${trait1.id + trait2.id}`);
        if (!svgElement) return;
        // const linkPoint1 = document.getElementById(`Animal${trait1.hostAnimalId}LinkPoint`);
        // const linkPoint2 = document.getElementById(`Animal${trait2.hostAnimalId}LinkPoint`);
        const base = document.getElementById(`PlayerSticker${trait1.ownerId}`);
        // const wrapper1 = document.getElementById(`PlayerWrapper${trait1.ownerId}`);

        const basebbx = base.getBoundingClientRect();
        const link1bbx = linkedTrait1html.getBoundingClientRect();
        const link2bbx = linkedTrait2html.getBoundingClientRect();

        // wrapper should be at top
        let x1 = link1bbx.width / 2 + link1bbx.left - basebbx.left;
        let y1 = link1bbx.height / 3 + link1bbx.top - basebbx.top;
        let x2 = link2bbx.width / 2 + link2bbx.left - basebbx.left;
        let y2 = link2bbx.height / 3 + link2bbx.top - basebbx.top;

        const reversed = x1 < x2;

        [x1, y1, x2, y2] = (reversed
          ? [x1, y1, x2, y2]
          : [x2, y2, x1, y1]);

        const angle = Math.atan2(y1 - y2, x1 - x2);

        svgElement.setAttribute('d', `M${x1},${y1} A 1 0.2 ${angle * 180 / Math.PI || 0} 1 1 ${x2},${y2}`);
        if (reversed) {
          svgElement.classList.remove('MarkerStart');
          svgElement.classList.add('MarkerEnd');
        } else {
          svgElement.classList.add('MarkerStart');
          svgElement.classList.remove('MarkerEnd');
        }
        svgElement.setAttribute('data-reversed', `M${x1},${y1} A 1 0.2 ${angle * 180 / Math.PI || 0} 1 1 ${x2},${y2}`);
        // console.log(svgElement.getAttribute('d'))
        // console.log(y1)
      }
    });
  }

  render() {
    const links = this.state.links;

    return (<svg width="100%" height="100%" style={{position: 'absolute', left: '0', top: '0', zIndex: 100, pointerEvents: 'none'}}>
      <defs>
        <AnimalTraitArrowMarker id='symbioticArrow' className='TraitSymbiosis Marker' markerSize={4}/>
      </defs>
      {links.map(([trait1id, trait2id]) => {
        if (!this.linkedTraits[trait1id]) return;
        if (!this.linkedTraits[trait2id]) return;
        const linkClassName = cn({
          [this.linkedTraits[trait1id].props.trait.type]: true
          , 'AnimalLinkedTrait--Link': true
        });
        return <path
          key={trait1id + trait2id}
          id={'Link' + trait1id + trait2id}
          className={linkClassName}
          style={linkedTraitPathStyle}/>
      })}
    </svg>)
  }
}


















