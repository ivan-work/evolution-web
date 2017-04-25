import React from 'react';
import PropTypes from 'prop-types'

export class Portal extends React.Component {
  static propTypes = {
    target: PropTypes.string.isRequired
  };

  static contextTypes = {
    portalsContext: PropTypes.object.isRequired
  };

  componentDidMount() {
    const portalContext = this.context.portalsContext;
    this.id = portalContext.mountPortal(this);
  }

  componentWillUnmount() {
    const portalContext = this.context.portalsContext;
    portalContext.unmountPortal(this);
  }

  componentDidUpdate() {
    const portalContext = this.context.portalsContext;
    portalContext.updatePortal(this);
  }

  renderChildren(container) {
    return React.createElement(container
      , null
      , this.props.children)
  }

  render() {
    return <span/>
  }
}