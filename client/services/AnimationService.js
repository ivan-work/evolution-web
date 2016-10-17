import React, {Component} from 'react';

const debug = true;
const log = debug ? console.log : () => null;

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
    this.currentAnimation = null;
    this.$subscribers = {};
    this.$queue = [];
  }

  componentSubscribe(component, actionType, callback) {
    log(`${component.displayName} subscribed for ${actionType}`);
    if (!this.$subscribers[actionType]) {
      this.$subscribers[actionType] = []
    }
    this.$subscribers[actionType].push({
      component, callback
    })
  }

  componentUpdated(updatedComponent) {
    log(`${updatedComponent.displayName} updated`, updatedComponent.state.animation);
    if (updatedComponent.state.animation) {
      const animation = this.currentAnimation;
      const {action} = animation;
      const subscribersForAction = this.$subscribers[action.type];

      log(`${updatedComponent.displayName} has animation ${action.type} in state`);

      // reset animation;
      updatedComponent.setState({animation: null});

      if (subscribersForAction) { // have subscribers on this type of action
        const currentSubscriber = subscribersForAction.find(({component}) =>
          component === updatedComponent // updated component is subscriber
          && !~animation.processedBy.indexOf(component) // is not processed yet by updated component
        );
        if (currentSubscriber) {
          const {component, callback} = currentSubscriber;
          log(`${updatedComponent.displayName} activating animation for ${action.type}`);
          animation.processedBy.push(component); // start processing;
          callback.call(component, this.makeCallbackExecutedFn(animation, subscribersForAction, component), component.wrappedComponent, action.data)
        }
      }
    }
  }

  componentUnsubscribe(unmountingComponent) {
  }

  makeCallbackExecutedFn(currentAnimation, subscribersForAction, component) {
    return () => {
      // One of the components has done it's animations!
      currentAnimation.completedBy.push(component);
      // Mark it as completed
      log(`completed ${currentAnimation.action.type}, ${currentAnimation.completedBy.length}/${subscribersForAction.length}`);
      if (currentAnimation.completedBy.length === subscribersForAction.length) {
        log(`queue length: ${this.$queue.length}`);
        if (this.$queue.length > 0) {
          const nextAnimation = this.$queue[0];
          this.$queue = this.$queue.slice(1);
          log(`changing current animation to`, nextAnimation);
          nextAnimation.next(nextAnimation.action);
          this.invokeAnimation(nextAnimation)
        } else {
          this.currentAnimation = null;
        }
      }
    }
  }

  processAction(next, action) {
    log(`processing action: ${action.type}`);
    if (this.currentAnimation) {
      log(`currently has animation: ${this.currentAnimation.action.type}. pushing to queue`);
      // If something is animating = add action to the queue
      this.$queue.push(new QueueItem(action, next));
    } else {
      // dispatch
      log(`dispatching ${action.type}`);
      next(action);
      // If not - check if we should animate this action
      this.invokeAnimation(new QueueItem(action));
    }
  }

  invokeAnimation (animation) {
    const subscribersForAction = this.$subscribers[animation.action.type];
    if (subscribersForAction && subscribersForAction.length > 0) {
      this.currentAnimation = animation;
      subscribersForAction.forEach(({component}) => {
        component.setState({animation: this.currentAnimation})
      })
    } else {
      this.currentAnimation = null;
    }
  }
}

export const AnimationService = new AnimationServiceClass();

export const animationMiddleware = () => ({dispatch, getState}) => next => action => {
  AnimationService.processAction(next, action);
  //console.log('processing action', action.type)
  //next(action)
};

export const AnimationServiceHOC = ({animations}) => (WrappedComponentClass) => class AnimationServiceHOC extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.displayName = 'ASHOC' + Math.floor(Math.random() * 0xFF);
    log(`Component ${this.displayName} initialized`);
    Object.keys(animations).forEach((actionType) => {
      const callback = animations[actionType];
      AnimationService.componentSubscribe(this, actionType, callback);
    });
  }

  componentDidUpdate() {
    AnimationService.componentUpdated(this)
  }

  componentWillUnmount() {
    AnimationService.componentUnsubscribe(this)
  }

  render() {
    return React.createElement(WrappedComponentClass, {
      ref: (component) => this.wrappedComponent = component
      , ...this.props
    });
  }
};