import { createStore, compose, applyMiddleware } from 'redux'

// Components
import { Root } from '../components/Root.jsx';

// Basic Middleware
import thunk from 'redux-thunk';
import { reduxTimeout } from '~/shared/utils/reduxTimeout'

export default configureStore = ({reducer, routerMiddleware, socketMiddleware}) => createStore(
  reducer
  , compose(
    applyMiddleware(thunk)
    , applyMiddleware(reduxTimeout())
    , applyMiddleware(routerMiddleware)
    , applyMiddleware(socketMiddleware)
    , DevTools.instrument()
  )
);