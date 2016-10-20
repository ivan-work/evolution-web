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
    if (process.env.TEST) {
      return <div>{this.props.children}</div>
    }
    return <div></div>;
  }
}

//import React, {Component} from 'react';
//import ReactDOM from 'react-dom';
//import PureRenderMixin from 'react-addons-pure-render-mixin';
//
//const PortalsMap = {};
//
//export class BodyPortalRoot extends Component {
//  React.
//}
//
//export class BodyPortal extends Component {
//  constructor(props) {
//    super(props);
//    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
//  }
//
//  static propTypes = {
//    name: React.PropTypes.string
//    , root: React.PropTypes.object
//  };
//
//  static defaultProps = {
//    name: React.PropTypes.string
//    , root:  React.DOM.div
//  };
//
//  componentDidMount() {
//    const name = this.props.name;
//    if (name) {
//      if (!PortalsMap[name]) PortalsMap[name] = [];
//
//      if (PortalsMap[name].length == 0) {
//        this.portalElement = PortalsMap[name].portalElement
//      } else {
//        this.portalElement = document.createElement('div');
//      }
//
//
//      this.portalElement = document.createElement('div');
//    } else {
//      this.portalElement = document.createElement('div');
//    }
//    document.body.appendChild(this.portalElement);
//    this.renderElement();
//  }
//
//  componentWillUnmount() {
//    ReactDOM.unmountComponentAtNode(this.portalElement);
//    document.body.removeChild(this.portalElement);
//  }
//
//  componentDidUpdate() {
//    this.renderElement();
//  }
//
//  renderElement() {
//    ReactDOM.render(
//      React.createElement(
//        this.props.tag
//        , null
//        , this.props.children
//      ), this.portalElement);
//  }
//
//  render() {
//    if (process.env.TEST) {
//      return <div>{this.props.children}</div>
//    }
//    return <div></div>;
//  }
//}