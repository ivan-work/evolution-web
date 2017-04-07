import {createReducer} from '~/shared/utils';

export const reducer = createReducer(null, {
  roomJoinSuccessSelf: (state, data) =>  data.roomId
});