class QueueItem {
  constructor(action, next) {
  }
}

export class AnimationServiceClass {
  constructor(log = console.log) {
  }

  componentSubscribe(component, actionType) {
  }

  componentUpdated(updatedComponent) {
  }

  componentUnsubscribe(unmountingComponent) {
  }

  processAction(next, action) {
    return next(action);
  }

  startAnimation(animation) {
  }

  completeCurrentAnimation(component) {
  }
}