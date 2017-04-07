import React, {Component} from 'react';
import './ControlGroup.scss';

export class ControlGroup extends Component {
  static propTypes = {
    name: React.PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
  }

  render() {
    return <div className='ControlGroup'>
      <div className='title'>{this.props.name}</div>
      <div className='body'>{this.props.children}</div>
    </div>;
  }
}