import React from 'react';
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom';
import T from 'i18n-react';
import cn from 'classnames';

import Tooltip from 'rc-tooltip';
import {Portal} from '../../utils/Portal.jsx';
// import {AnimalTrait, ClickAnimalTrait} from './AnimalTrait.jsx';
// import AnimalTraitArrowMarker from './AnimalTraitArrowMarker.jsx';

import {ANIMAL_TRAIT_HEIGHT} from '../../../styles.json';
import {SVGContext} from "../SVGContext";

const AnimalLinkedTraits = [];

export class AnimalLinkedTrait extends React.PureComponent {
  static contextType = SVGContext;

  constructor(props) {
    super(props);
  }

  static propTypes = {
    trait: PropTypes.object.isRequired
    , sourceAnimal: PropTypes.object.isRequired
    , children: PropTypes.node.isRequired
  };

  componentDidMount() {
    this.context.mountLinkedTrait(this);
  }

  componentWillUnmount() {
    this.context.unmountLinkedTrait(this);
  }

  render() {
    const {children} = this.props;
    return children;
  }
}

export default AnimalLinkedTrait;

// export const AnimalLinkedTraitConsumer = (props) => (
//   <SVGContext.Consumer>
//     {svgContext => <AnimalLinkedTrait svgContext={svgContext} {...props}/>}
//   </SVGContext.Consumer>
// );
//
// export default AnimalLinkedTraitConsumer;