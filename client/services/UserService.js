import PropTypes from 'prop-types'

export class UserServiceClass {
  constructor(getState) {
    //if (!getState) throw new Error('UserService is not initialized');
    this.getState = getState;
  }

  get(userId) {
    return this.getState().getIn(['online', userId]);
  }

  getPlayerName(id) {
    // console.log(id, this.getState().getIn(['online', id, 'login']))
    return this.getState().getIn(['online', id, 'login'], '---');
  }
}

export const UserServicePropType = PropTypes.instanceOf(UserServiceClass).isRequired;