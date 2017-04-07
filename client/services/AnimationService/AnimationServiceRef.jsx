import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export const AnimationServiceRef = (WrappedComponentClass) => class AnimationServiceRef extends Component {
  static contextTypes = {
    animationServiceContext: React.PropTypes.object
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentWillMount() {
    this.connectRef = (name) => (component) => {
      this.context.animationServiceContext.setRef(name, component);
    };
    this.getRef = this.context.animationServiceContext.getRef
  }

  render() {
    return React.createElement(WrappedComponentClass, {
      connectRef: this.connectRef
      , getRef: this.getRef
      , ...this.props
    });
  }
};