import React from 'react';
import PropTypes from 'prop-types'
import './ControlGroup.scss';

export class ControlGroup extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired
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