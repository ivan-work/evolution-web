import logger from '~/shared/utils/logger';

export const rqActionAsk = (question, maxTime) => ({
  type: '@@reduxQuestion/rqActionAsk'
  , data: {question, maxTime}
});

const rqActionQuestion = (id, question) => ({
  type: '@@reduxQuestion/rqActionQuestion'
  , data: {id, question}
  , meta: question.meta
});

const rqActionAnswer = (id, data) => ({
  type: '@@reduxQuestion/rqActionAnswer'
  , data: {id, data}
  , meta: {server: true}
});

export const reduxQuestion = (promisesStore = {}) => ({dispatch, getState}) => next => action => {
  if (action.type === '@@reduxQuestion/rqActionAsk') {
    const {question, maxTime} = action.data;

    const questionPromise = new Promise((resolve, reject) => {
      if (typeof question !== 'object') throw new Error('question is not an object');
      const id = Math.floor(Math.random() * 0xFFFFFF);
      promisesStore[id] = {resolve, reject};
      dispatch(rqActionQuestion(id, question));
    })

    // If max time not set = return just promise. Race with time otherwise
    return (maxTime === void 0
      ? questionPromise
      : Promise.race([
      questionPromise
      , new Promise((resolve, reject) => setTimeout(() => resolve(null), maxTime))
    ]));
  } else if (action.type === '@@reduxQuestion/rqActionAnswer') {
    const {id, data} = action.data;
    if (promisesStore[id]) {
      const {resolve, reject} = promisesStore[id];
      delete promisesStore[id];
      resolve(data);
    }
  } else {
    return next(action);
  }
};

export const rqClientToServer = {
  '@@reduxQuestion/rqActionAnswer': ({id, data}) => rqActionAnswer(id, data)
};

export const rqServerToClient = {
  '@@reduxQuestion/rqActionQuestion': ({id, question}) => (dispatch, getState) => {
    if (clientOnQuestion[question.type]) {
      let answer = dispatch(clientOnQuestion[question.type](question.data));
      if (!answer || typeof answer.then !== 'function') {
        answer = Promise.resolve(answer);
      }
      answer.then((data) => dispatch(rqActionAnswer(id, data)));
    } else {
      logger.warn('clientOnQuestion action doesnt exist: ' + question.type);
    }
  }
};

export const clientOnQuestion = {
  testAction: (data) => (dispatch) => 'test' + data
};