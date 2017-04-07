import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export class Dialog extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    this.popup = document.createElement('div');
    this.popup.classList.add('DialogContainer');
    document.body.appendChild(this.popup);
    this._renderLayer();
  }

  componentDidUpdate() {
    this._renderLayer();
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.popup);
    document.body.removeChild(this.popup);
  }

  _renderLayer() {
    ReactDOM.render(<div className='Backdrop'>
      <div className='Dialog mdl-dialog'>{this.props.children}</div>
    </div>, this.popup);
  }

  render() {
    // Render a placeholder
    return <div></div>;
  }
}

export const DialogActions = (props) => <div className='DialogActions'>{props.children}</div>