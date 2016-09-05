import { createStore, compose, applyMiddleware } from 'redux'

// Components
import { Root } from '../components/Root.jsx';
import { DevTools } from '../components/DevTools.jsx';

// Basic Middleware
import thunk from 'redux-thunk';
import { reduxTimeout } from '~/shared/utils/reduxTimeout'

export default ({reducer, router, socket}) => createStore(
  reducer
  , compose(
    applyMiddleware(thunk)
    , applyMiddleware(reduxTimeout())
    , applyMiddleware(router)
    , applyMiddleware(socket)
    , DevTools.instrument()
  )
);