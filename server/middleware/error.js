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
    } else {
      try {
        logger.error(`GenericError${actionType}:`, process.env.NODE_ENV === 'production' ? {
          message: error.message
          , stack: error.stack
        } : error);
      } catch (loggerError) {
        logger.error(`GenericError${actionType}:`, error);
        logger.error(`LOGGER ERROR ${actionType}:`, loggerError);
      }
      if (process.env.TEST) throw error;
    }
    return error;
    //next(action);
  }
};