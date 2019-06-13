import {createStore, compose, applyMiddleware} from 'redux'

// Basic Middleware
import {Record} from 'immutable';
import thunk from 'redux-thunk';
import {reduxTimeoutMiddleware} from '../../shared/utils/reduxTimeout'

const ClientRecord = Record({
  app: void 0
  , error: void 0
  , game: void 0
  , online: void 0
  , room: void 0
  , rooms: void 0
  , user: void 0
  , chat: void 0
  , modal: void 0
  , animation: void 0
}, 'ClientRecord');

const composeEnhancers = process.env.TEST ? compose : window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default (reducer, initialState, middleware = [], appliedMiddleware = []) => createStore(
  reducer
  , ClientRecord(initialState)
  , composeEnhancers(
    applyMiddleware(
      store => next => action => {
        try {
          return next(action);
        } catch (error) {
          if (process.env.TEST) throw error;
          else console.error(error);
        }
      }
      , thunk
      , reduxTimeoutMiddleware()
      , ...middleware
    )
    , ...appliedMiddleware
  )
);