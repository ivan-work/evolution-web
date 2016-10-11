import React, {Component} from 'react';

export const PortalTargets = {};

export class PortalTarget extends Component {
  static propTypes = {
    name: React.PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {portals: []};
  }

  componentDidMount() {
    if (PortalTargets[this.name]) throw new Error('Multiple PortalTarget NYI. Conflict with name: ' + this.props.name)
    PortalTargets[this.name] = this;
  }

  componentWillUnmount() {
    delete PortalTargets[this.name];
  }

  add(portal) {
    let portals = this.state.portals;
    portals.push(portal);
    this.setState({portals});
  }

  remove(portal) {
    let portals = this.state.portals;
    portals.remove(portal);
    this.setState({portals});
  }

  update() {
    this.forceUpdate();
  }

  render() {
    return <span>{
      this.state.portals
        .map(portal => React.cloneElement(portal.renderChildren(), {
        key: portal.id
        }))
      }
    </span>
  }
}