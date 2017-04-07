import React, {Component} from 'react';
//import PureRenderMixin from 'react-addons-pure-render-mixin';

export const PortalsContext = (WrappedComponent) => class PortalsContext extends Component {
  constructor(props) {
    super(props);
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
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
    if (context.portalsContext[this.props.name]) throw new Error('Multiple PortalTarget NYI. Conflict with name: ' + this.props.name)
    context.portalsContext[this.props.name] = this;
  }

  componentDidMount() {
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
    return React.createElement(this.props.container
      , null
      , this.state.portals
        .map(portal => React.cloneElement(portal.renderChildren(this.props.container), {
          key: portal.id
        })))
  }
}