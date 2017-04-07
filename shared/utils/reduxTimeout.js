export const addTimeout = function addTimeout(duration, name, callback) {
  return {
    type: '@@reduxTimeout/addTimeout',
    data: {
      duration,
      name,
      callback
    }
  };
};

export const cancelTimeout = function cancelTimeout(name) {
  return {
    type: '@@reduxTimeout/cancelTimeout',
    data: {name}
  };
};

export const reduxTimeout = function () {
  const timeouts = {};
  return store => next => action => {
    if (action.type === '@@reduxTimeout/addTimeout') {
      const {duration, name, callback} = action.data;
      if (timeouts[name]) throw new Error(`reduxTimeout: timeout[${name}] already occupied!`);
      timeouts[name] = setTimeout(() => {
        store.dispatch(typeof callback === 'object' ? callback : callback(store.dispatch, store.getState));
        timeouts[name] = void 0;
      }, duration);
    } else if (action.type === '@@reduxTimeout/cancelTimeout') {
      const nameToClear = action.data.name;
      if (!timeouts[nameToClear]) throw new Error(`reduxTimeout: timeout[${name}] doesnt exists!`);
      clearTimeout(timeouts[nameToClear]);
      timeouts[name] = void 0;
    }
    next(action);
  };
};