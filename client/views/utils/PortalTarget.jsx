import React, {Component} from 'react';
//import PureRenderMixin from 'react-addons-pure-render-mixin';

export const PortalsContext = (WrappedComponent) => class PortalsContext extends Component {
  constructor(props) {
    super(props);
    this.portalIds = 0;
    this.portalsMap = {};
    this.portalTargetsMap = {};

    this.portalRequests = {}; // {portalTargetName => portals to the target}
  }

  static childContextTypes = {
    portalsContext: React.PropTypes.object.isRequired
  };

  getChildContext() {
    return {portalsContext: this};
  }

  mountPortal(portal) {
    const id = this.portalIds++;
    const target = portal.props.target;
    this.portalsMap[id] = portal;

    if (!target) console.error('target undefined');
    if (!this.portalRequests[target]) this.portalRequests[target] = {};
    if (!this.portalRequests[target][id]) this.portalRequests[target][id] = true;

    this.updateStatePortalTarget(target);

    return id;
  }

  unmountPortal(portal) {
    const id = portal.id;
    const target = portal.props.target;

    if (!target) console.error('target undefined');
    delete this.portalsMap[id];
    if (this.portalRequests[target])
      if (this.portalRequests[target][id])
        delete this.portalRequests[target][id];

    this.updateStatePortalTarget(target);
  }

  updatePortal(portal) {
    const target = portal.props.target;

    if (!target) console.error('target undefined');
    const portalTarget = this.getPortalTargetByName(target);
    if (portalTarget) portalTarget.forceUpdate();
  }

  mountPortalTarget(portalTarget) {
    const name = portalTarget.props.name;
    if (this.portalTargetsMap[name]) throw new Error('Multiple PortalTarget NYI. Conflict with name: ' + this.props.name)
    this.portalTargetsMap[name] = portalTarget;

    this.updateStatePortalTarget(name);
  }

  unmountPortalTarget(portalTarget) {
    const name = portalTarget.props.name;

    delete this.portalTargetsMap[name];
  }

  getPortalTargetByName(name) {
    return this.portalTargetsMap[name];
  }

  updateStatePortalTarget(target) {
    const portalTarget = this.getPortalTargetByName(target);
    if (portalTarget && this.portalRequests[target])
      portalTarget.setState({
        portals: Object.keys(this.portalRequests[target]).map(id => this.portalsMap[id])
      });
  }

  render() {
    return <div className="PortalsContext">
      <WrappedComponent {...this.props}/>;
      <PortalTarget name='body'/>
    </div>
  }
};

export class PortalTarget extends Component {
  static contextTypes = {
    portalsContext: React.PropTypes.object.isRequired
  };

  static propTypes = {
    name: React.PropTypes.string.isRequired
    , container: React.PropTypes.string
  };

  static defaultProps = {
    container: 'span'
  };

  constructor(props, context) {
    super(props);
    this.state = {portals: []};
  }

  componentDidMount() {
    const portalsContext = this.context.portalsContext;
    portalsContext.mountPortalTarget(this);
  }

  componentWillUnmount() {
    const portalsContext = this.context.portalsContext;
    portalsContext.unmountPortalTarget(this);
  }

  render() {
    return React.createElement(this.props.container
      , null
      , this.state.portals
        .map(portal => React.cloneElement(portal.renderChildren(this.props.container), {
          key: portal.id
        })))
  }
}