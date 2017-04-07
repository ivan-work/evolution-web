import React, {Component} from 'react'
import {UserServiceClass, UserServicePropType} from './UserService'

export const ServicesContext = (WrappedComponentClass) => class ServicesContext extends Component {
  static contextTypes = {
    store: React.PropTypes.object.isRequired
  };

  static childContextTypes = {
    userService: UserServicePropType
  };

  getChildContext() {
    return {
      userService: this.userService
    }
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.userService = new UserServiceClass(this.context.store.getState);
  }

  render() {
    return React.createElement(WrappedComponentClass, this.props);
  }
};