import {PropTypes} from 'react';

export class UserServiceClass {
  constructor(getState) {
    //if (!getState) throw new Error('UserService is not initialized');
    this.getState = getState;
  }

  get(userId) {
    return this.getState().getIn(['online', userId]);
  }
}

export const UserService = new UserServiceClass();

export const UserServicePropType = PropTypes.instanceOf(UserServiceClass).isRequired;