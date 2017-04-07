import logger from '~/shared/utils/logger';
import {ActionCheckError} from '~/shared/models/ActionCheckError';
import util from 'util';

export const errorMiddleware = interceptor => store => next => action => {
  try {
    return next(action);
  } catch (error) {
    if (error instanceof ActionCheckError) {
      logger.warn(error.name + ': ' + util.format(error.message, ...error.data));
    }
    else {
      logger.error('GenericError:', error);
    }
    return error;
    //next(action);
  }
};