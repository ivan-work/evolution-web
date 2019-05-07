import React from 'react';
import ReactDOM from "react-dom";
import cn from 'classnames';
import withStyles from '@material-ui/core/styles/withStyles';
import debounce from 'lodash/debounce';

import {SVGContext} from "./SVGContext";

import GameStyles from "./GameStyles";

const styles = {
  GameSVGOverlay: {
    position: 'absolute'
    , zIndex: 10
    , overflow: 'visible'
    , pointerEvents: 'none'
  }
  , AnimalTraitLink: {
    strokeWidth: 8
    , stroke: 'black'
    , opacity: .5
    , fill: 'none'
    , ...GameStyles.addTraitColors((colorConfig) => ({
      stroke: colorConfig.text
    }))
  }
};

const isTraitInLink = (link, traitId) => link[0] === traitId || link[1] === traitId;

export class GameSVGOverlay extends React.Component {
  static contextType = SVGContext;

  overlayRef = React.createRef();

  traitComponents = {};

  state = {
    links: []
  };

  componentDidMount() {
    this.$isMounted = true;
    this.context.mountSVGOverlay(this);
    window.addEventListener("resize", this.debounceUpdateSVG);
  }

  componentWillUnmount() {
    this.$isMounted = false;
    this.context.unmountSVGOverlay(this);
    window.removeEventListener("resize", this.debounceUpdateSVG);
    this.traitComponents = null;
  }

  componentDidUpdate() {
    this.debounceUpdateSVG();
  }

  mountLinkedTrait = (animalLinkedTraitComponent) => {
    if (this.$isMounted) {
      // console.log('mountLinkedTrait', animalLinkedTraitComponent);
      const trait1 = animalLinkedTraitComponent.props.trait;
      this.traitComponents[trait1.id] = animalLinkedTraitComponent;

      if (this.traitComponents[trait1.linkId]
        && !this.state.links.some(link => isTraitInLink(link, trait1.id))
      ) {
        const newLink = trait1.linkSource ? [trait1.id, trait1.linkId] : [trait1.linkId, trait1.id];
        this.setState(({links}) => ({links: [...links, newLink]}));
      }
    }
  };

  unmountLinkedTrait = (animalLinkedTraitComponent) => {
    if (this.$isMounted) {
      const trait = animalLinkedTraitComponent.props.trait;
      if (this.traitComponents[trait.id]) {
        delete this.traitComponents[trait.id];
        this.setState(({links}) => ({links: links.filter(link => !isTraitInLink(link, trait.id))}));
      }
    }
  };

  updateSVG = () => {
    // console.log('GameSVGOverlay.updateSVG()');
    const {classes} = this.props;
    if (this.overlayRef.current) {
      const basebbx = this.overlayRef.current.getBoundingClientRect();
      this.state.links.forEach((link) => {
        const svgElement = document.getElementById(`Link${link[0] + link[1]}`);
        const linkedTrait1 = this.traitComponents[link[0]];
        const linkedTrait2 = this.traitComponents[link[1]];

        if (!svgElement || !linkedTrait1 || !linkedTrait2) return;

        const trait1 = linkedTrait1.props.trait;
        const trait2 = linkedTrait2.props.trait;
        const linkedTrait1html = ReactDOM.findDOMNode(linkedTrait1);
        const linkedTrait2html = ReactDOM.findDOMNode(linkedTrait2);
        const link1bbx = linkedTrait1html.getBoundingClientRect();
        const link2bbx = linkedTrait2html.getBoundingClientRect();
        const linkhw = link1bbx.width * .5;
        const linkhh = link1bbx.height * .5;
        let x1 = linkhw + link1bbx.left - basebbx.left;
        let y1 = linkhh + link1bbx.top - basebbx.top;
        let x2 = linkhw + link2bbx.left - basebbx.left;
        let y2 = linkhh + link2bbx.top - basebbx.top;

        let linkdx = x1 - x2;
        let linkdy = y1 - y2;
        let linkdxS = Math.sign(linkdx);
        let linkdyS = Math.sign(linkdy);

        let linkdmain = 0;

        if (Math.abs(linkdx) > Math.abs(linkdy)) {
          if (linkdx > 0) {
            x1 -= linkhw;
            x2 += linkhw;
          } else {
            x1 += linkhw;
            x2 -= linkhw;
          }
          linkdyS = 0;
          linkdmain = Math.abs(x1 - x2);
        } else {
          if (linkdy > 0) {
            y1 -= linkhh;
            y2 += linkhh;
          } else {
            y1 += linkhh;
            y2 -= linkhh;
          }
          linkdxS = 0;
          linkdmain = Math.abs(y1 - y2);
        }

        linkdmain *= .8;

        const className = cn(classes.AnimalTraitLink, trait1.type);

        const d = [
          `M${x1},${y1}`
          , `C${x1 - linkdxS * linkdmain},${y1 - linkdyS * linkdmain}`
          , `${x2 + linkdxS * linkdmain},${y2 + linkdyS * linkdmain}`
          , `${x2},${y2}`
        ];

        svgElement.setAttribute('class', className);
        svgElement.setAttribute('d', d.join(' '));

        // debug circles!
        // const pts = [
        //   [x1, y1, 'black']
        //   , [x1 - linkdxS * linkdmain, y1 - linkdyS * linkdmain, 'red']
        //   // , [x2 + linkdxS * linkdmain, y2 + linkdyS * linkdmain]
        //   , [x2, y2, 'blue']
        // ];
        // const svg = document.getElementById('GameSVGOverlay');
        // pts.forEach(([x, y, color]) => {
        //   const p = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        //   p.setAttribute('cx', x)
        //   p.setAttribute('cy', y)
        //   p.setAttribute('r', '3')
        //   p.setAttribute('fill', color)
        //   svg.appendChild(p)
        // });
      });
    }
  };

  debounceUpdateSVG = debounce(this.updateSVG, 500);

  render() {
    const {classes} = this.props;
    return <svg id='GameSVGOverlay' className={classes.GameSVGOverlay} ref={this.overlayRef}>
      {this.state.links.map(this.renderLink)}
    </svg>;
  }

  renderLink = (link) => {
    return (
      <path key={link[0] + link[1]} id={`Link${link[0] + link[1]}`}/>
    );
  };
}

export default withStyles(styles)(GameSVGOverlay);