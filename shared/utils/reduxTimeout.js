import logger from '~/shared/utils/logger';

class Timer {
  constructor(callback, delay) {
    this.callback = callback;
    this.remaining = delay;
    this.start();
  }

  start() {
    this.running = true;
    this.started = new Date();
    this.id = setTimeout(this.callback, this.remaining);
    this.id.unref();
  }

  pause() {
    this.running = false;
    clearTimeout(this.id);
    this.remaining -= new Date() - this.started
    return this.remaining;
  }

  getRemaining() {
    if (this.running) {
      this.pause();
      this.start();
    }
    return this.remaining
  }
}

export const addTimeout = (duration, name, callback) => ({
  type: '@@reduxTimeoutMiddleware/addTimeout',
  data: {duration, name, callback}
});

export const cancelTimeout = (name) => ({
  type: '@@reduxTimeoutMiddleware/cancelTimeout',
  data: {name}
});

export const reduxTimeoutMiddleware = (timeouts = {}) => ({dispatch, getState}) => next => action => {
  if (action.type === '@@reduxTimeoutMiddleware/addTimeout') {
    const {duration, name, callback} = action.data;
    if (duration === 0) return;
    logger.debug('@@reduxTimeoutMiddleware/addTimeout', duration, name, typeof callback);
    if (timeouts[name]) throw new Error(`reduxTimeout: timeout[${name}] already occupied!`);
    timeouts[name] = new Timer(() => {
      logger.verbose('@@reduxTimeoutMiddleware/executeTimeout', name);
      timeouts[name] = void 0;
      dispatch(callback)
    }, duration);
  } else if (action.type === '@@reduxTimeoutMiddleware/cancelTimeout') {
    const nameToClear = action.data.name;
    logger.debug('@@reduxTimeoutMiddleware/cancelTimeout', nameToClear);
    //console.log('cancelTimeout', action.type)
    //if (!timeouts[nameToClear]) throw new Error(`reduxTimeoutMiddleware: timeout[${name}] doesnt exists!`);
    if (timeouts[nameToClear]) {
      const remaining = timeouts[nameToClear].pause();
      delete timeouts[nameToClear];
      return remaining;
    }
  } else {
    return next(action);
  }
};