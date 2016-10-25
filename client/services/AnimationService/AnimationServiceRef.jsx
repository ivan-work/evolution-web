import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export const AnimationServiceRef = (WrappedComponentClass) => class AnimationServiceRef extends Component {
  static contextTypes = {
    animationServiceContext: React.PropTypes.object
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.connectRef = (name) => (component) => {
      this.context.animationServiceContext.refs[name] = component;
    };
  }

  render() {
    return React.createElement(WrappedComponentClass, {
      connectRef: this.connectRef
      , ...this.props
    });
  }
};