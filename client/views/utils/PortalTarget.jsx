import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export const PortalsContext = (WrappedComponent) => class PortalsContext extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.portalsContext = {};
  }

  static childContextTypes = {
    portalsContext: React.PropTypes.object.isRequired
  };

  getChildContext() {
    return {portalsContext: this.portalsContext};
  }

  render() {
    return <WrappedComponent {...this.props}/>;
  }
};

export class PortalTarget extends Component {
  static propTypes = {
    name: React.PropTypes.string.isRequired
  };

  static contextTypes = {
    portalsContext: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {portals: []};
  }

  componentDidMount() {
    if (this.context.portalsContext[this.props.name]) throw new Error('Multiple PortalTarget NYI. Conflict with name: ' + this.props.name)
    this.context.portalsContext[this.props.name] = this;
    this.$isMounted = true;
  }

  componentWillUnmount() {
    delete this.context.portalsContext[this.props.name];
    this.$isMounted = false;
  }

  add(portal) {
    let portals = this.state.portals;
    portals.push(portal);
    this.setState({portals});
  }

  remove(portal) {
    let portals = this.state.portals;
    portals.remove(portal);
    if (this.$isMounted) {
      this.setState({portals});
    }
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