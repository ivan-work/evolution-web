import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export class BodyPortal extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    this.portalElement = document.createElement('div');
    document.body.appendChild(this.portalElement);
    this.renderElement();
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.portalElement);
    document.body.removeChild(this.portalElement);
  }

  componentDidUpdate() {
    this.renderElement();
  }

  renderElement() {
    ReactDOM.render(<div {...this.props}>{this.props.children}</div>, this.portalElement);
  }

  render() {
    // Render a placeholder
    return <div></div>;
  }
}