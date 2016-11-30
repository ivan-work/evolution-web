import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export const AnimationServiceRef = (WrappedComponentClass) => class AnimationServiceRef extends Component {
  static contextTypes = {
    animationServiceContext: React.PropTypes.object
  };

  constructor(props, context) {
    super(props);
    if (!context || !context.animationServiceContext) throw new Error(WrappedComponentClass.displayName + ': context.animationServiceContext is undefined')
    const animationServiceContext = context.animationServiceContext;
    this.connectRef = (name) => (component) => animationServiceContext.setRef(name, component);
    this.getRef = animationServiceContext.getRef
  }

  render() {
    return React.createElement(WrappedComponentClass, {
      connectRef: this.connectRef
      , getRef: this.getRef
      , ...this.props
    });
  }
};