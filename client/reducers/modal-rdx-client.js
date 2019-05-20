import {Record} from 'immutable';
import {createReducer} from '~/shared/utils';

const AppModalRecord = Record({
  type: null
  , data: null
  , showModal: true
}, 'AppModalRecord')

const getInitialState = () => AppModalRecord();

export const reducer = createReducer(getInitialState(), {
  openDialog: (state, {type, data = null}) => AppModalRecord({type, data})
  , closeDialog: getInitialState
  , showDialog: (state) => state.set('showModal', true)
  , hideDialog: (state) => state.set('showModal', false)
});