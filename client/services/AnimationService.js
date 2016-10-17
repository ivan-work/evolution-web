import React, {Component} from 'react';

const debug = false;
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

  componentSubscribe(component, actionType) {
    log(`${component.displayName} subscribed for ${actionType}`);
    if (!this.$subscribers[actionType]) this.$subscribers[actionType] = [];
    this.$subscribers[actionType].push(component)
  }

  componentUpdated(updatedComponent) {
    log(`${updatedComponent.displayName} updated`, updatedComponent.state.animation);
    if (updatedComponent.state.animation) {
      const animation = this.currentAnimation;
      const actionType = animation.action.type;
      const subscribersForAction = this.$subscribers[actionType];

      log(`${updatedComponent.displayName} has animation ${actionType} in state`);

      // reset animation;
      updatedComponent.setState({animation: null});

      if (subscribersForAction) { // have subscribers on this type of action
        const component = subscribersForAction.find((component) =>
          component === updatedComponent // updated component is subscriber
          && !~animation.processedBy.indexOf(component) // is not processed yet by updated component
        );
        if (component) {
          log(`${component.displayName} activating animation for ${actionType}`);
          animation.processedBy.push(component); // start processing;
          component.getAnimation(actionType)
            .call(null, () => this.completeCurrentAnimation(component), component.wrappedComponent, animation.action.data)
        }
      }
    }
  }

  componentUnsubscribe(unmountingComponent) {
    const subscribers = this.$subscribers;
    this.$subscribers = Object.keys(subscribers).reduce((result, actionType) => {
      result[actionType] = subscribers[actionType].filter(component => component !== unmountingComponent);
      return result;
    }, {});
    this.completeCurrentAnimation(unmountingComponent);
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
      this.startAnimation(new QueueItem(action));
    }
  }

  startAnimation(animation) {
    const subscribersForAction = this.$subscribers[animation.action.type];
    if (subscribersForAction && subscribersForAction.length > 0) {
      this.currentAnimation = animation;
      subscribersForAction.forEach((component) => {
        if (component._isMounted) {
          component.setState({animation: this.currentAnimation})
        } else {
          this.completeCurrentAnimation(component);
        }
      })
    } else {
      this.currentAnimation = null;
    }
  }

  completeCurrentAnimation(component) {
    if (this.currentAnimation) {
      const subscribersForAction = this.$subscribers[this.currentAnimation.action.type];
      if (subscribersForAction.some(c => c === component) && !this.currentAnimation.completedBy.some(c => c === component)) {
        this.currentAnimation.completedBy.push(component);
        log(`completed ${this.currentAnimation.action.type}, ${this.currentAnimation.completedBy.length}/${subscribersForAction.length}`);
        if (this.currentAnimation.completedBy.length === subscribersForAction.length) {
          log(`queue length: ${this.$queue.length}`);
          if (this.$queue.length > 0) {
            const nextAnimation = this.$queue[0];
            this.$queue = this.$queue.slice(1);
            log(`changing current animation to`, nextAnimation);
            nextAnimation.next(nextAnimation.action);
            this.startAnimation(nextAnimation)
          } else {
            this.currentAnimation = null;
          }
        }
      }
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
    this._isMounted = true;
    this.animations = animations;
    Object.keys(animations).forEach((actionType) => {
      AnimationService.componentSubscribe(this, actionType);
    });
  }

  componentDidUpdate() {
    AnimationService.componentUpdated(this)
  }

  componentWillUnmount() {
    this._isMounted = false;
    AnimationService.componentUnsubscribe(this)
  }

  getAnimation(actionType) {
    return this.animations[actionType];
  }

  render() {
    return React.createElement(WrappedComponentClass, {
      ref: (component) => this.wrappedComponent = component
      , ...this.props
    });
  }
};