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
    this.createSubscription = this.createSubscription.bind(this);
    this.setRef = this.setRef.bind(this);
    this.getRef = this.getRef.bind(this);
    this.animationRefs = {};
    this.subscriptions = [];
    this.waitForUpdate = [];
    this.animations = animations({
      subscribe: this.createSubscription
      , getRef: this.getRef
    });
  }

  createSubscription(actionType, callback) {
    const subscriptionData = {props: this.props, callback};
    const subscription = new Promise((resolve, reject) => {
      this.waitForUpdate.push({resolve, reject, subscriptionData});
    });
    this.subscriptions.push(subscription);
    AnimationService.subscribe(actionType, subscription);
  }

  setRef(name, component) {
    this.animationRefs[name] = component;
  }

  getRef(name) {
    if (!this.animationRefs[name]) console.warn(`Ref(${name}) is undefined`)
    return this.animationRefs[name];
  }

  componentDidUpdate() {
    this.waitForUpdate.forEach(({resolve, subscriptionData}) => resolve(subscriptionData));
    this.waitForUpdate = [];
  }

  componentWillUnmount() {
    this.waitForUpdate.forEach(({resolve}) => resolve(null));
    this.waitForUpdate = [];
    this.subscriptions.forEach((subscription) => AnimationService.unsubscribe(subscription));
    this.subscriptions = [];
  }

  render() {
    return React.createElement(WrappedComponentClass, this.props);
  }
};