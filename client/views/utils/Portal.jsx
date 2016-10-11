import React, {Component} from 'react';

import {PortalTargets} from './PortalTarget.jsx';

export class Portal extends Component {
  static propTypes = {
    target: React.PropTypes.string.isRequired
  };

  componentDidMount() {
    this.id = Math.floor(Math.random() * 0xFFFFFF);
    this.target = PortalTargets[this.target];
    if (this.target) {
      this.target.add(this);
    }
  }

  componentWillUnmount() {
    if (this.target) {
      this.target.remove(this);
    }
  }

  componentDidUpdate() {
    if (this.target) {
      this.target.update();
    }
  }

  renderChildren() {
    return <span>{this.props.children}</span>;
  }

  render() {
    return <span></span>
  }
}