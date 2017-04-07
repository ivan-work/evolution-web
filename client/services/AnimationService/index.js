import {AnimationServiceClass} from './AnimationServiceClass';

const debug = false;
const log = debug ? console.log : () => null;

export const animationMiddleware = () => ({dispatch, getState}) => next => action =>
  AnimationService.processAction(dispatch, getState, next, action);

export const AnimationService = new AnimationServiceClass(log);

export {AnimationServiceContext} from './AnimationServiceContext.jsx';

export {AnimationServiceRef} from './AnimationServiceRef.jsx';