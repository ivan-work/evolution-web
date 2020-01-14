import {Map} from 'immutable';
import {createReducer} from '~/shared/utils';

export const reducer = createReducer(Map(), {
  loginUser: (users, {user}) => users.set(user.id, user)
  , logoutUser: (users, {userId}) => users.remove(userId)
  , chatMessageUser: (users, {message}) => users.updateIn([message.to, 'chat'], chat => chat.receiveMessage(message))
  , userUpdateName: (users, {userId, name}) => users.setIn([userId, 'login'], name)
});