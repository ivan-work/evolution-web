class UserServiceClass {
  start(getState) {
    this.getState = getState;
  }

  get(userId) {
    return this.getState().getIn(['online', userId]);
  }
}

export const UserService = new UserServiceClass();