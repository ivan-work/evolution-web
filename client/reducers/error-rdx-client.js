import {createReducer} from '~/shared/utils';

export const reducer = createReducer(null, {
  actionError: (state, {error}) => (!process.env.TEST ? error : null)
});