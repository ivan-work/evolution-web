import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Portal} from './Portal.jsx';

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
    const bbx = ReactDOM.findDOMNode(component).getBoundingClientRect();
    this.setState({component, bbx})
  }

  hideTooltip() {
    this.setState({component: null, bbx: null})
  }

  render() {
    return <div>
      <Portal target='tooltips'>
        {this.state.component ? this.renderTooltip() : null}
      </Portal>
      <WrappedComponent {...this.props}/>
    </div>;
  }

  renderTooltip() {
    const {component, bbx} = this.state;
    return <div style={{
      position: 'absolute'
      , left: bbx.left + bbx.width + 'px'
      , top: bbx.top - 40 + 'px'
    }}>
      {component.renderTooltip()}
    </div>
  }
};

export class Tooltip extends Component {
  static propTypes = {
    tip: React.PropTypes.string.isRequired
    , children: React.PropTypes.node.isRequired
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
    const {tip} = this.props;
    return <div>{tip}</div>
  }

  render() {
    const {children} = this.props;
    return React.cloneElement(children, {
      onMouseEnter: this.showTooltip
      , onMouseLeave: this.hideTooltip
    });
  }
}