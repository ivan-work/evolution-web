import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export class ControlGroup extends Component {
  static propTypes = {
    name: React.PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    return <div className='control-group'>
      <div className='control-group__title'>{this.props.name}</div>
      <div className='control-group__body'>{this.props.children}</div>
    </div>;
  }
}