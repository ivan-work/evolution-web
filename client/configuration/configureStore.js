import { createStore, compose, applyMiddleware } from 'redux'

// Basic Middleware
import thunk from 'redux-thunk';
import { reduxTimeout } from '~/shared/utils/reduxTimeout'
// Services
import {animationMiddleware} from '../services/AnimationService';


export default (reducer, initialState, middleware = [], appliedMiddleware = []) => createStore(
  reducer
  , initialState
  , compose(
    applyMiddleware(
      thunk
      , reduxTimeout()
      , ...middleware
      , animationMiddleware()
    )
    , ...appliedMiddleware
  )
);