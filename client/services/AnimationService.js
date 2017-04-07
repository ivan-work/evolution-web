import React, {Component} from 'react';

class QueueItem {
  constructor(action, next) {
    this.action = action;
    this.next = next;
    this.processedBy = [];
    this.completedBy = [];
  }
}

class AnimationServiceClass {
  constructor() {
    this.$hooks = {};
    this.$queue = [];
    this.currentAnimation = null;
  }

  componentSubscribe(component, actionType, callback) {
    if (!this.$hooks[actionType]) {
      this.$hooks[actionType] = {
        subscribers: []
      };
    }
    this.$hooks[actionType].subscribers.push({
      component, actionType, callback
    })
  }

  componentUpdated(updatedComponent) {
    // If has queue
    if (this.currentAnimation) {
      const currentAction = this.currentAnimation;
      const hook = this.$hooks[currentAction.action.type];
      if (hook) { // have hook on this type of action
        const hookSubscriber = hook.subscribers.find(({component}) =>
          component === updatedComponent // that hook has updated component as subscriber
          && !~currentAction.processedBy.indexOf(component) // is not processed yet by updated component
        );
        if (hookSubscriber) {
          const {action} = currentAction;
          const {component, actionType, callback} = hookSubscriber;
          currentAction.processedBy.push(component); // start processing;
          callback.call(component, this.makeCallbackExecutedFn(currentAction, hook, component), component.wrappedComponent, action.data)
        }
      }
    }
  }

  componentUnmount(unmountingComponent) {
    //Object.keys(this.$hooks).forEach((actionType) => {
    //  this.$hooks[actionType].subscribers = this.$hooks[actionType].subscribers
    //    .filter(({component, actionType, callback}) => component !== unmountingComponent);
    //this.$hooks[actionType].subscribers.push({
    //  component, actionType, callback
    //})
    //});
  }

  makeCallbackExecutedFn(currentAction, hook, component) {
    return () => {
      // One of the components has done it's animations!
      currentAction.completedBy.push(component);
      // Mark it as completed
      if (currentAction.completedBy.length === hook.subscribers.length) {
        this.$queue = this.$queue.slice(1);
        if (this.$queue.length > 0) {
          this.currentAnimation = this.$queue[0];
          this.currentAnimation.next(this.currentAnimation.action);
        } else {
          this.currentAnimation = null;
        }
      }
    }
  }

  processAction(next, action) {
    if (this.currentAnimation) {
      console.log('currentAnimation', this.currentAnimation.action.type)
      // If something is animating = add action to the queue
      this.$queue.push(new QueueItem(action, next));
    } else {
      // If not - check if we should animate this action
      if (this.$hooks[action.type] && this.$hooks[action.type].subscribers.length > 0) {
        this.currentAnimation = new QueueItem(action);
      }
      // dispatch
      next(action);
    }
  }
}

export const AnimationService = new AnimationServiceClass();

export const animationMiddleware = () => ({dispatch, getState}) => next => action => {
  AnimationService.processAction(next, action);
};

export const AnimationServiceHOC = ({animations}) => (WrappedComponentClass) => class AnimationServiceHOC extends Component {
  componentDidMount() {
    Object.keys(animations).forEach((actionType) => {
      const callback = animations[actionType];
      AnimationService.componentSubscribe(this, actionType, callback);
    });
  }

  componentDidUpdate() {
    AnimationService.componentUpdated(this)
  }

  componentWillUnmount() {
    AnimationService.componentUnmount(this)
  }

  render() {
    return React.createElement(WrappedComponentClass, {
      ref: (component) => this.wrappedComponent = component
      , ...this.props
    });
  }
};