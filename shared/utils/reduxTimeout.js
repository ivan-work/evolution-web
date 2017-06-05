import logger from '~/shared/utils/logger';

class TestTimer {
  constructor(callback, delay) {
    this.callback = callback;
    this.remaining = delay;
  }

  pause() {
    return this.remaining;
  }

  shiftTime(time) {
    this.remaining = this.remaining - time;
    if (this.remaining <= 0) {
      this.callback();
    }
  }
}

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
    this.remaining -= new Date() - this.started;
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

export const checkTimeout = (name) => ({
  type: '@@reduxTimeoutMiddleware/checkTimeout',
  data: {name}
});

export const testShiftTime = (time) => ({
  type: '@@reduxTimeoutMiddleware/testShiftTime',
  data: {time}
});

export const reduxTimeoutMiddleware = (timeouts = {}, test) => ({dispatch, getState}) => next => action => {
  const TimerClass = !test ? Timer : TestTimer;
  if (action.type === '@@reduxTimeoutMiddleware/addTimeout') {
    const {duration, name, callback} = action.data;
    if (duration === 0) return;
    logger.debug('@@reduxTimeoutMiddleware/addTimeout', duration, name, typeof callback);
    if (timeouts[name]) throw new Error(`reduxTimeout: timeout[${name}] already occupied!`);

    timeouts[name] = new TimerClass(() => {
      logger.verbose('@@reduxTimeoutMiddleware/executeTimeout', name);
      delete timeouts[name];
      dispatch(callback)
    }, duration);
  } else if (action.type === '@@reduxTimeoutMiddleware/cancelTimeout') {
    const nameToClear = action.data.name;
    logger.debug(`@@reduxTimeoutMiddleware/cancelTimeout ${nameToClear} ${!!timeouts[nameToClear]}`);
    //console.log('cancelTimeout', action.type)
    //if (!timeouts[nameToClear]) throw new Error(`reduxTimeoutMiddleware: timeout[${name}] doesnt exists!`);
    if (timeouts[nameToClear]) {
      const remaining = timeouts[nameToClear].pause();
      delete timeouts[nameToClear];
      return remaining;
    }
  } else if (action.type === '@@reduxTimeoutMiddleware/checkTimeout') {
    const nameToClear = action.data.name;
    return (!!timeouts[nameToClear]);
  } else if (action.type === '@@reduxTimeoutMiddleware/testShiftTime') {
    const time = action.data.time;
    Object.keys(timeouts)
      .forEach(name => timeouts[name].shiftTime(time));
  } else {
    return next(action);
  }
};