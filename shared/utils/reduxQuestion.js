import logger from '~/shared/utils/logger';

export const server$askQuestion = (action) => (dispatch, getState) =>
  new Promise((resolve, reject) => {
    if (typeof action !== 'object') throw new Error('action is not an object');
    const id = Math.floor(Math.random() * 0xFFFFFF);
    globalPromiseStore[id] = {resolve, reject};
    dispatch(actionQuestion(id, action));
  });

const actionQuestion = (id, action) => ({
  type: '@@reduxQuestion/actionQuestion'
  , data: {id, action}
  , meta: action.meta
});

const actionAnswer = (id, data) => ({
  type: '@@reduxQuestion/actionAnswer'
  , data: {id, data}
  , meta: {server: true}
});

export const reduxQuestion = (promises = {}) => ({dispatch, getState}) => next => action => {
  if (action.type === '@@reduxQuestion/actionQuestion') {
    const {action, maxTime} = action.data;

    const id = Math.floor(Math.random() * 0xFFFFFF);
    promises[id] = action


    //logger.silly('@@reduxTimeout/addTimeout', name, typeof callback);
    //if (timeouts[name]) throw new Error(`reduxTimeout: timeout[${name}] already occupied!`);
    //timeouts[name] = new Timer(() => {
    //  timeouts[name] = void 0;
    //  dispatch(callback)
    //}, duration);
  } else if (action.type === '@@reduxQuestion/actionAnswer') {
    //const nameToClear = action.data.name;
    //logger.silly('@@reduxTimeout/cancelTimeout', nameToClear);
    ////console.log('cancelTimeout', action.type)
    ////if (!timeouts[nameToClear]) throw new Error(`reduxTimeout: timeout[${name}] doesnt exists!`);
    //if (timeouts[nameToClear]) {
    //  timeouts[nameToClear].pause();
    //  timeouts[nameToClear] = void 0;
    //}
  } else {
    return next(action);
  }
};