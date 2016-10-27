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
  type: '@@reduxTimeout/addTimeout',
  data: {
    duration,
    name,
    callback
  }
});

export const cancelTimeout = function cancelTimeout(name) {
  return {
    type: '@@reduxTimeout/cancelTimeout',
    data: {name}
  };
};

export const reduxTimeout = (timeouts = {}) => ({dispatch, getState}) => next => action => {
  if (action.type === '@@reduxTimeout/addTimeout') {
    const {duration, name, callback} = action.data;
    logger.silly('@@reduxTimeout/addTimeout', name, typeof callback);
    if (timeouts[name]) throw new Error(`reduxTimeout: timeout[${name}] already occupied!`);
    timeouts[name] = new Timer(() => {
      timeouts[name] = void 0;
      dispatch(callback)
    }, duration);
  } else if (action.type === '@@reduxTimeout/cancelTimeout') {
    const nameToClear = action.data.name;
    logger.silly('@@reduxTimeout/cancelTimeout', nameToClear);
    //console.log('cancelTimeout', action.type)
    //if (!timeouts[nameToClear]) throw new Error(`reduxTimeout: timeout[${name}] doesnt exists!`);
    if (timeouts[nameToClear]) {
      timeouts[nameToClear].pause();
      timeouts[nameToClear] = void 0;
    }
  } else {
    return next(action);
  }
};