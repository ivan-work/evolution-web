import {AnimationServiceClass} from './AnimationServiceClass';

export const animationMiddleware = () => ({dispatch, getState}) => next => action =>
  AnimationService.processAction(dispatch, getState, next, action);

export const AnimationService = new AnimationServiceClass();

export {AnimationServiceContext} from './AnimationServiceContext.jsx';

export {AnimationServiceRef} from './AnimationServiceRef.jsx';