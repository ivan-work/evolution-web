import logger from '~/shared/utils/logger';
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import util from 'util';

export const errorMiddleware = interceptor => store => next => action => {
  try {
    return next(action);
  } catch (error) {
    let actionType = action.type ? `(${action.type})` : '';
    if (error instanceof ActionCheckError) {
      logger.warn(`${error.name}${actionType}: ` + util.format(error.message, ...error.data));
    } else {
      logger.error(`GenericError${actionType}:`, error);
    }
    return error;
    //next(action);
  }
};