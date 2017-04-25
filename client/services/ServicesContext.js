import React from 'react'
import PropTypes from 'prop-types'

export const ServicesContext = (WrappedComponentClass) => class ServicesContext extends React.Component {
  static contextTypes = {
    store: PropTypes.object.isRequired
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