import React from 'react';
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom';
import T from 'i18n-react';
import cn from 'classnames';

import Tooltip from 'rc-tooltip';
import {Portal} from '../../utils/Portal.jsx';
import {AnimalTrait, ClickAnimalTrait} from './AnimalTrait.jsx';
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
  }

  componentWillUnmount() {
    this.$isMounted = false;
    this.context.svgContext.then((context) => {
      context.unmountLinkedTrait(this);
    });
  }

  render() {
    const {children} = this.props;
    return (<div>{children}</div>);
  }
}