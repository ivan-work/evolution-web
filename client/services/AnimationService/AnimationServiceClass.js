export class AnimationServiceClass {
  //constructor(log = console.log) {
  constructor(log = () => 0) {
    this.$log = log;
    this.$queue = [];
    this.$subscriptions = {};
  }

  subscribe(actionType, subscription) {
    this.$log(`AnimationService:${actionType}`, 'subscribe');
    if (!this.$subscriptions[actionType]) this.$subscriptions[actionType] = [];
    this.$subscriptions[actionType].push(subscription)
  }

  unsubscribe(subscription) {
    this.$log(`AnimationService:unsubscribe`);
    Object.keys(this.$subscriptions).forEach((actionType) => {
      this.$subscriptions[actionType] = this.$subscriptions[actionType].remove(subscription);
    });
  }

  requestFromQueue(dispatch) {
    if (this.$queue.length > 0) {
      const nextAction = this.$queue[0];
      this.$queue = this.$queue.slice(1);
      dispatch(nextAction);
    }
  }

  processAction(dispatch, getState, next, action) {
    this.$log(`AnimationService:PA(${action.type}) Startx`, this.$subscriptions);
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
      Promise.all(subscriptionsForAction.map(subscription => subscription.waitForUpdate(action.data, getState)))
        .then(() => {
          this.$log(`AnimationService:PA(${action.type})`, `END: queue(${this.$queue.length})`);
          this.currentAnimation = false;
          this.requestFromQueue(dispatch);
        });
      return next(action);
    } else {
      this.$log(`AnimationService:PA(${action.type})`, `END: Normal action, queue(${this.$queue.length})`);
      const result = next(action);
      this.requestFromQueue(dispatch);
      return result;
    }
  }
}