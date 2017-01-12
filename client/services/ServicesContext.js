import React, {Component} from 'react'

export const ServicesContext = (WrappedComponentClass) => class ServicesContext extends Component {
  static contextTypes = {
    store: React.PropTypes.object.isRequired
  };

  static childContextTypes = {
  };

  getChildContext() {
    return {
    }
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  render() {
    return React.createElement(WrappedComponentClass, this.props);
  }
};