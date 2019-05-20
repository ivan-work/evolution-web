import {UserModel} from '~/shared/models/UserModel';

export const reducer = (state, action) => process.env.TEST ? null : action.type;