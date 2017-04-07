import React from 'react';
import {createStore, applyMiddleware} from 'redux';
import {animationMiddleware, AnimationServiceContext, AnimationServiceRef} from './index';

export const setCounter = (counterId, counterValue = 1) => ({type: 'setCounter' + counterId, data: {counterId, counterValue}});
const defaultReducer = (state, action) => {
  if (action.type.startsWith('setCounter')) {
    state = action.data.counterId;
  }
  return state;
};
export const configureStore = (reducer = defaultReducer) => createStore(reducer, 0, applyMiddleware(animationMiddleware()));

export const SIZE = 8;
export const TestASRef = AnimationServiceRef(({getState, id, connectRef}) => (
  <div className='TestASRef' ref={connectRef(id)}>{getState() == id ? 'CURRENT' : null}</div>));

export const TestAS = ({getState}) => <div>
  {Array.from({length: SIZE}).map((u, i) => <TestASRef key={i} id={i} getState={getState}/>)}
</div>;