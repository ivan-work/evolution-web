import {Map, List, Record} from 'immutable';
import {UserModel} from '~/shared/models/UserModel';
import {createReducer} from "../../shared/utils";

let localReducer;

const AnimationsRecord = Record({
  current: Map()
  , queue: List()
});

const AnimationRecord = Record({
  type: null
  , data: null
  , id: null
  , state: null
  , capture: List()
});

if (process.env.TEST) {
  localReducer = () => null;
} else {
  localReducer = createReducer(AnimationsRecord(), {
    animationStart: (state, animationRecord) => state.setIn(['current', animationRecord.id], animationRecord)
    , animationEnd: (state, animationRecordId) => state.removeIn(['current', animationRecordId])
    , animationQueueAction: (state, action) => state.update('queue', queue => queue.push(action))
    , animationQueueDrain: (state) => state.update('queue', queue => queue.clear())
  });
}


export const animationStart = (data) => ({type: 'animationStart', data: data});
export const animationEnd = (animationRecordId) => ({type: 'animationEnd', data: animationRecordId});
export const animationQueueAction = (action) => ({type: 'animationQueueAction', data: action});
export const animationQueueDrain = () => ({type: 'animationQueueDrain'});
export const animationCompleted = (animationId) => ({type: 'animationCompleted', data: animationId});

export const animationSubscribe = (actions) => ({type: 'animationSubscribe', data: actions});
export const animationUnsubscribe = (subscriptionId) => ({type: 'animationUnsubscribe', data: subscriptionId});

export const uiv3animationMiddleware = (subscriptions = {}) => {
  let SUBSCRIPTION_ID = 0;
  let ID = 0;
  return ({dispatch, getState}) => next => action => {
    const animations = getState().animations;
    // console.log(action.type, animations.toJS());
    switch (action.type) {
      case 'animationSubscribe': {
        // const subscriptionId = SUBSCRIPTION_ID++;
        // const actions = action.data;
        // actions.forEach(actionType => {
        //   subscriptions.push([subscriptionId, actionType]);
        // });
        // return subscriptionId;
      }
      case 'animationUnsubscribe': {
        // const subscriptionId = action.data;
        // subscriptions = subscriptions.filter(([subId, actionType]) => {
        //   subId
        // });
        // const actions = action.data;
        // actions.forEach(actionType => {
        //   subscriptions.push([subscriptionId, actionType]);
        // });
        // return subscriptionId;
      }
      case 'animationStart':
      case 'animationEnd':
      case 'animationQueueAction':
        next(action);
        break;
      case 'animationCompleted':
        next(action);
        dispatch(animationEnd(action.data));
        dispatch(animationQueueDrain());
        break;
      case 'animationQueueDrain':
        next(action);
        animations.queue.forEach(dispatch);
        break;
      default: {
        if (animations.current.size > 0) {
          dispatch(animationQueueAction(action));
        } else {
          // if (action.type === animations.subscribed) {
          //   const {animalId} = action.data;
          //   const animation = AnimationRecord({
          //     type: action.type
          //     , id: ID++
          //     , data: animalId
          //   });
          //
          //   dispatch(animationStart(animation));
          // }
          next(action);
        }
      }
    }
  };
}

export const reducer = localReducer;