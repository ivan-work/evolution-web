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
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.state = {};
    this.refs = {};
  }

  componentDidMount() {
    //log(`Component ${this.displayName} initialized`);
    this._isMounted = true;
    this.animations = animations({
      getRef: (name) => this.refs[name]
    });
    Object.keys(this.animations).forEach((actionType) => {
      AnimationService.componentSubscribe(this, actionType);
    });
  }

  componentDidUpdate() {
    AnimationService.componentUpdated(this)
  }

  componentWillUnmount() {
    this._isMounted = false;
    AnimationService.componentUnsubscribe(this);
    this.state = null;
    this.refs = null;
  }

  getAnimation(actionType) {
    return this.animations[actionType];
  }

  render() {
    return React.createElement(WrappedComponentClass, this.props);
  }
};