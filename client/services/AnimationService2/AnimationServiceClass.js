const createSubscription = (props, callback) => ({props, callback});

export class AnimationServiceClass {
  constructor(log = console.log) {
    this.$log = log;
    this.$queue = [];
    this.$subscriptions = {};
  }

  subscribe(component, actionType, callback) {
    if (!this.$subscriptions[actionType]) this.$subscriptions[actionType] = [];
    this.$subscriptions[actionType].push(createSubscription(component.props, callback))
  }

  processAction(dispatch, next, action) {
    this.$log(`AnimationService:PA(${action.type})`, 'Start');
    const subscriptionsForAction = this.$subscriptions[action.type];
    if (!!this.currentAnimation) {
      this.$log(`AnimationService:PA(${action.type})`, 'END: Push to queue');
      // if already animating something - push to queue
      //let nextAction;
      //const actionResolvedPromise = new Promise((resolve) =>
      //  nextAction = () => resolve(dispatch(action)));
      this.$queue.push(action);
      //return actionResolvedPromise;
    } else if (subscriptionsForAction && subscriptionsForAction.length > 0) {
      this.$log(`AnimationService:PA(${action.type})`, 'startAnimating');
      // if not - then start
      this.currentAnimation = true;
      Promise.all(subscriptionsForAction.map(subscription => {
          const {props, callback} = subscription;
          return new Promise((resolve) => callback(() => resolve(true), props, action.data))
        }))
        .then(() => {
          this.$log(`AnimationService:PA(${action.type})`, `END: queue(${this.$queue.length})`);
          this.currentAnimation = false;
          if (this.$queue.length > 0) {
            const nextAction = this.$queue[0];
            this.$queue = this.$queue.slice(1);
            dispatch(nextAction);
          }
        });
      return next(action);
    } else {
      this.$log(`AnimationService:PA(${action.type})`, `END: Normal action, queue(${this.$queue.length})`);
      const result = next(action);
      if (this.$queue.length > 0) {
        const nextAction = this.$queue[0];
        this.$queue = this.$queue.slice(1);
        dispatch(nextAction);
      }
      return result;
    }
  }

  startAnimation(animation) {
  }

  completeCurrentAnimation(component) {
  }
}