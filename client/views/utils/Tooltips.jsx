import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Portal} from './Portal.jsx';
import Measure from 'react-measure';

export const TooltipsContext = (WrappedComponent) => class TooltipsContext extends Component {
  constructor(props) {
    super(props);
    this.tooltipsContext = {};
    this.state = {};
  }

  static childContextTypes = {
    tooltipsContext: React.PropTypes.object.isRequired
  };

  getChildContext() {
    return {tooltipsContext: this};
  }

  showTooltip(component) {
    if (component.label !== null) {
      const bbx = ReactDOM.findDOMNode(component).getBoundingClientRect();
      this.setState({component, bbx})
    }
  }

  hideTooltip() {
    this.setState({component: null, bbx: null})
  }

  render() {
    return <div className='TooltipsContext'>
      <Portal target='tooltips'>
        {this.state.component && this.renderTooltip()}
      </Portal>
      <WrappedComponent {...this.props}/>
    </div>;
  }

  renderTooltip() {
    const {component, bbx} = this.state;
    const {offseth, offsetv} = component.props;
    return <Measure>
      {({width, height}) => (
        <div style={{
          position: 'absolute'
          , left: bbx.left + 'px'
          , top: bbx.top - offsetv - (height || 200) + 'px'
        }}>
          {component.renderTooltip()}
        </div>
      )}
    </Measure>
  }
};

export class TooltipsContextElement extends TooltipsContext(({children}) => children) {
  static propTypes = {
    children: React.PropTypes.node.isRequired
  };

  render() {
    return <div className='TooltipsContext'>
      {this.props.children}
      {/*this.state.component ? this.renderTooltip() : null*/}
    </div>;
  }
}

export class Tooltip extends Component {
  static propTypes = {
    label: React.PropTypes.any
    , children: React.PropTypes.node.isRequired
    , offseth: React.PropTypes.number
    , offsetv: React.PropTypes.number
  };

  static defaultProps = {
    offseth: 40
    , offsetv: 40
  };

  static contextTypes = {
    tooltipsContext: React.PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.renderTooltip = this.renderTooltip.bind(this);
    this.showTooltip = () => this.context.tooltipsContext.showTooltip(this);
    this.hideTooltip = () => this.context.tooltipsContext.hideTooltip(this);
  }

  renderTooltip() {
    const {label} = this.props;
    return (typeof label === 'string' ? <span>{label}</span>
      : label);
  }

  render() {
    const {children} = this.props;
    return React.cloneElement(children, {
      onMouseEnter: this.showTooltip
      , onMouseLeave: this.hideTooltip
    });
  }
}