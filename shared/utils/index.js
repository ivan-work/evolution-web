import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

export function createConstants(...constants) {
  return constants.reduce((acc, constant) => {
    acc[constant] = constant;
    return acc;
  }, {});
}

export function createReducer(initialState, reducerMap) {
  return (state = initialState, action) => {
    const reducer = reducerMap[action.type];

    return reducer
      ? reducer(state, action.data)
      : state;
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

export function ensureParameter (data, type, optional) {
  if (!data && !optional) throw new Error('Required data is undefined');
  if (typeof type === 'string') {
    if (typeof data !== type) {
      throw new Error(`Data [${data}] is not typeof ${type}`);
    }
  } else if (!(data instanceof type)) {
    throw new Error(`Data [${data}] is not instanceof of ${type}`);
  }
}

export function parseJSON(response) {
  return response.json()
}