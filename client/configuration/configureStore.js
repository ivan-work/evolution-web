import {createStore, compose, applyMiddleware} from 'redux'

// Basic Middleware
import {Record} from 'immutable';
import thunk from 'redux-thunk';
import {reduxTimeoutMiddleware} from '../../shared/utils/reduxTimeout'

class ClientRecord extends Record({
  app: void 0
  , error: void 0
  , game: void 0
  , online: void 0
  , room: void 0
  , rooms: void 0
  , user: void 0
  , routing: void 0
  , chat: void 0
}) {
}

export default (reducer, initialState, middleware = [], appliedMiddleware = []) => createStore(
  reducer
  , new ClientRecord(initialState)
  , compose(
    applyMiddleware(
      thunk
      , reduxTimeoutMiddleware()
      , ...middleware
    )
    , ...appliedMiddleware
  )
);