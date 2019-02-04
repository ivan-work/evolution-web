export function createConstants(...constants) {
  return constants.reduce((acc, constant) => {
    acc[constant] = constant;
    return acc;
  }, {});
}

export function createReducer(initialState, reducerMap) {
  return (state = initialState, action) => {
    // console.log(Object.keys(reducerMap), state, initialState)
    const reducer = reducerMap[action.type];

    return reducer
      ? reducer(state, action.data, action.user)
      : state;

    // With mutations?
    //if (reducer) {
    //  if (state && state.asMutable) {
    //    const result = reducer(state.asMutable(), action.data, action.user);
    //    if (result) {
    //      return result.asImmutable();
    //    } else {
    //      return null;
    //    }
    //  } else {
    //    return reducer(state, action.data, action.user);
    //  }
    //} else {
    //  return state;
    //}
  };
}

export function checkHttpStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error
  }
}

export const promisify = (fn) => (...args) => new Promise((resolve, reject) =>
  fn(...args, (error, ...data) => (error ? reject(error) : resolve(...data))));

export function ensureParameter(data, type, optional) {
  if (!optional && data === void 0) throw new Error('Required data is undefined');
  if (typeof type === 'string') {
    if (typeof data !== type) {
      throw new Error(`Data <${data}> is not typeof ${type}`);
    }
  } else if (!(data instanceof type)) {
    throw new Error(`Data <${data}> is not instanceof of ${type}`);
  }
}

export function validateParameter(data, validateFn, string) {
  const validation = typeof validateFn !== 'function' ? validateFn : validateFn(data);
  if (validation !== true) {
    throw new Error(`${string} (${data})`);
  }
}