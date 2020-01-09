import React from 'react';
import PropTypes from 'prop-types'

import {SVGContext} from "../SVGContext";

export class LinkedTrait extends React.PureComponent {
  static contextType = SVGContext;

  constructor(props) {
    super(props);
  }

  static propTypes = {
    trait: PropTypes.object.isRequired
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

export default LinkedTrait;