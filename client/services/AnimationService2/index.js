import {AnimationServiceClass} from './AnimationServiceClass';

const debug = true;
const log = debug ? console.log : () => null;

export const animationMiddleware = () => ({dispatch, getState}) => next => action =>
  AnimationService.processAction(next, action);

export const AnimationService = new AnimationServiceClass(log);

export {AnimationServiceContext} from './AnimationServiceContext.jsx';

export {AnimationServiceRef} from './AnimationServiceRef.jsx';