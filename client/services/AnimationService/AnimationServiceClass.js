class QueueItem {
  constructor(action, next) {
    this.action = action;
    this.next = next;
    this.processedBy = [];
    this.completedBy = [];
  }
}

export class AnimationServiceClass {
  constructor(log = () => null) {
    this.currentAnimation = null;
    this.$subscribers = {};
    this.$queue = [];
    this.log = log;
  }

  componentSubscribe(component, actionType) {
    this.log(`${component.displayName} subscribed for ${actionType}`);
    if (!this.$subscribers[actionType]) this.$subscribers[actionType] = [];
    this.$subscribers[actionType].push(component)
  }

  componentUpdated(updatedComponent) {
    this.log(`${updatedComponent.displayName} updated`, updatedComponent.state.animation);
    if (updatedComponent.state.animation) {
      const animation = this.currentAnimation;
      const actionType = animation.action.type;
      const subscribersForAction = this.$subscribers[actionType];

      this.log(`${updatedComponent.displayName} has animation ${actionType} in state`);

      // reset animation;
      updatedComponent.setState({animation: null});

      if (subscribersForAction) { // have subscribers on this type of action
        const component = subscribersForAction.find((component) =>
          component === updatedComponent // updated component is subscriber
          && !~animation.processedBy.indexOf(component) // is not processed yet by updated component
        );
        if (component) {
          this.log(`${component.displayName} activating animation for ${actionType}`);
          animation.processedBy.push(component); // start processing;
          component.getAnimation(actionType)
            .call(null, () => this.completeCurrentAnimation(component), component.props, animation.action.data)
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
    this.log(`processing action: ${action.type}`);
    if (this.currentAnimation) {
      this.log(`currently has animation: ${this.currentAnimation.action.type}. pushing to queue`);
      // If something is animating = add action to the queue
      this.$queue.push(new QueueItem(action, next));
    } else {
      // dispatch
      this.log(`dispatching ${action.type}`);
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
        this.log(`completed ${this.currentAnimation.action.type}, ${this.currentAnimation.completedBy.length}/${subscribersForAction.length}`);
        if (this.currentAnimation.completedBy.length === subscribersForAction.length) {
          this.log(`queue length: ${this.$queue.length}`);
          if (this.$queue.length > 0) {
            const nextAnimation = this.$queue[0];
            this.$queue = this.$queue.slice(1);
            this.log(`changing current animation to`, nextAnimation);
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