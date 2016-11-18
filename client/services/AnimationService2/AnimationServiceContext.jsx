import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {AnimationService} from './index';

export const AnimationServiceContext = ({animations}) => (WrappedComponentClass) => class AnimationServiceContext extends Component {
  static childContextTypes = {
    animationServiceContext: React.PropTypes.object
  };

  getChildContext() {
    return {
      animationServiceContext: this
    }
  };

  constructor(props) {
    super(props);
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.setRef = this.setRef.bind(this);
    this.getRef = this.getRef.bind(this);
    this.animationRefs = {};
    this.animations = animations({
      subscribe: AnimationService.subscribe.bind(AnimationService, this)
      , getRef: this.getRef
    });
  }

  setRef(name, component) {
    this.animationRefs[name] = component;
  }

  getRef(name) {
    return this.animationRefs[name];
  }

  componentDidMount() {
    //Object.keys(this.animations).forEach((actionType) => {
    //  AnimationService.componentSubscribe(this, actionType);
    //});
  }

  componentDidUpdate() {
  }

  componentWillUnmount() {
    this.animationRefs = {};
  }

  getAnimation(actionType) {
    return this.animations[actionType];
  }

  render() {
    return React.createElement(WrappedComponentClass, this.props);
  }
};