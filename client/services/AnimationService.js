class AnimationServiceClass {
  constructor() {
    this.$actions = {};
    this.$queue = [];
    this.animationInProgress = false;
  }

  after(actionType, callback) {
    this.$actions[actionType] = {
      callback
    };
  }

  off (actionType) {
    delete this.$actions[actionType];
  }

  has (actionType) {
    return this.$actions[actionType];
  }

  processAction(next, action) {
    if (this.animationInProgress) {
      this.$queue.push({next, action})
    } else if (this.has(action.type)) {
      this.animateAction(next, action);
    } else {
      next(action);
    }
  }

  animateAction(next, action) {
    this.animationInProgress = true;

    next(action);

    const doneFn = () => {
      this.nextInQueue();
    };

    console.log('animate action', action.type);
    this.$actions[action.type].callback(doneFn, action);
  }

  nextInQueue() {
    const nextQueueItem = this.$queue[0];
    if (nextQueueItem) {
      this.$queue = this.$queue.slice(1);
      if (this.has(nextQueueItem.action.type)) {
        this.animateAction(nextQueueItem.next, nextQueueItem.action);
      } else {
        nextQueueItem.next(nextQueueItem.action);
        this.nextInQueue();
      }
    } else {
      this.animationInProgress = false;
    }
  }
}

export const AnimationService = new AnimationServiceClass();

export const animationMiddleware = () => ({dispatch, getState}) => next => action => {
  AnimationService.processAction(next, action);
};