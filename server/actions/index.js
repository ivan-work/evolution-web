export * from './auth';

export const clientAction = (action) => ({
  type: action.type
  , action: action
});