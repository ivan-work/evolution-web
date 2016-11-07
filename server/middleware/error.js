import logger from '~/shared/utils/logger';
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import util from 'util';

export const errorMiddleware = (interceptor = () => null) => store => next => action => {
  try {
    return next(action);
  } catch (error) {
    let actionType = action.type ? `(${action.type})` : '';
    if (error instanceof ActionCheckError) {
      logger.warn(`${error.name}${actionType}: ` + util.format(error.message, ...error.data));
      return false;
    } else {
      logger.error(`GenericError${actionType}:`, error);
    }
    //next(action);
  }
};