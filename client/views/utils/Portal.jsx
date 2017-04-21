import React, {Component} from 'react';

export class Portal extends Component {
  static propTypes = {
    target: React.PropTypes.string.isRequired
  };

  static contextTypes = {
    portalsContext: React.PropTypes.object.isRequired
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